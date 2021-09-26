import { GameConstants } from "../../games/games.mjs"

// Renders odometry data onto a canvas
export class OdometryRenderer {
  #canvas = null
  #img = null
  #lastImgSrc = null

  #inchesPerMeter = 39.37007874015748

  constructor(canvas) {
    this.#canvas = canvas
    this.#img = document.createElement("img")
    canvas.appendChild(this.#img)
  }

  // Renders new data
  render(command) {
    // Utility function to scale value between two ranges
    function scaleValue(value, oldMin, oldMax, newMin, newMax) {
      return (((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin)) + newMin
    }

    // Set up canvas
    var context = this.#canvas.getContext("2d")
    var width = this.#canvas.clientWidth
    var height = this.#canvas.clientHeight
    this.#canvas.width = width * window.devicePixelRatio
    this.#canvas.height = height * window.devicePixelRatio
    context.scale(window.devicePixelRatio, window.devicePixelRatio)
    context.clearRect(0, 0, width, height)

    // Get game data and update image element
    var gameData = GameConstants.find(x => x.title == command.coordinates.game)
    if (gameData.filename != this.#lastImgSrc) {
      this.#lastImgSrc = gameData.filename
      this.#img.src = "../games/" + gameData.filename
    }
    if (!(this.#img.width > 0 && this.#img.height > 0)) {
      return null
    }

    // Determine field layout
    var fieldFlipped = command.robot.orientation != "blue, red"
    var robotRight = Boolean(command.robot.alliance != "blue" ^ fieldFlipped)

    // Render background
    var fieldWidth = gameData.bottomRight[0] - gameData.topLeft[0]
    var fieldHeight = gameData.bottomRight[1] - gameData.topLeft[1]

    var topMargin = gameData.topLeft[1]
    var bottomMargin = this.#img.height - gameData.bottomRight[1]
    var leftMargin = gameData.topLeft[0]
    var rightMargin = this.#img.width - gameData.bottomRight[0]

    var margin = Math.min(topMargin, bottomMargin, leftMargin, rightMargin)
    var extendedFieldWidth = fieldWidth + margin * 2
    var extendedFieldHeight = fieldHeight + margin * 2
    var constrainHeight = (width / height) > (extendedFieldWidth / extendedFieldHeight)
    if (constrainHeight) {
      var imageScalar = height / extendedFieldHeight
    } else {
      var imageScalar = width / extendedFieldWidth
    }
    var fieldCenterX = fieldWidth * 0.5 + gameData.topLeft[0]
    var fieldCenterY = fieldHeight * 0.5 + gameData.topLeft[1]
    var renderValues = [
      Math.floor(width * 0.5 - fieldCenterX * imageScalar), // X (normal)
      Math.floor(height * 0.5 - fieldCenterY * imageScalar), // Y (normal)
      Math.ceil(width * -0.5 - fieldCenterX * imageScalar), // X (flipped)
      Math.ceil(height * -0.5 - fieldCenterY * imageScalar), // Y (flipped)
      this.#img.width * imageScalar, // Width
      this.#img.height * imageScalar // Height
    ]
    if (fieldFlipped) {
      context.save()
      context.scale(-1, -1)
    }
    context.drawImage(this.#img, renderValues[fieldFlipped ? 2 : 0], renderValues[fieldFlipped ? 3 : 1], renderValues[4], renderValues[5])
    if (fieldFlipped) {
      context.restore()
    }

    // Calculate field edges
    var canvasFieldLeft = renderValues[0] + (gameData.topLeft[0] * imageScalar)
    var canvasFieldTop = renderValues[1] + (gameData.topLeft[1] * imageScalar)
    var canvasFieldWidth = fieldWidth * imageScalar
    var canvasFieldHeight = fieldHeight * imageScalar
    var pixelsPerInch = ((canvasFieldHeight / gameData.heightInches) + (canvasFieldWidth / gameData.widthInches)) / 2

    // Convert pose data to pixel coordinates
    var calcCoordinates = position => {
      if (command.coordinates.unitDistance == "inches") {
        var positionInches = position
      } else {
        var positionInches = [position[0] * this.#inchesPerMeter, position[1] * this.#inchesPerMeter]
      }

      positionInches[1] *= -1 // Positive y is flipped on the canvas
      switch (command.coordinates.origin) {
        case "left":
          break
        case "center":
          positionInches[1] += gameData.heightInches / 2
          break
        case "right":
          positionInches[1] += gameData.heightInches
          break
      }

      var positionPixels = [positionInches[0] * (canvasFieldWidth / gameData.widthInches), positionInches[1] * (canvasFieldHeight / gameData.heightInches)]
      if (robotRight) {
        positionPixels[0] = canvasFieldLeft + canvasFieldWidth - positionPixels[0]
        positionPixels[1] = canvasFieldTop + canvasFieldHeight - positionPixels[1]
      } else {
        positionPixels[0] += canvasFieldLeft
        positionPixels[1] += canvasFieldTop
      }
      return positionPixels
    }

    // Transform pixel coordinate based on robot rotation
    var transform = (relativePosition, rotation, centerPosition) => {
      var length = Math.sqrt((relativePosition[0] * relativePosition[0]) + (relativePosition[1] * relativePosition[1]))
      var newAngle = Math.atan2(-relativePosition[1], relativePosition[0]) + rotation
      return [
        centerPosition[0] + (Math.cos(newAngle) * length),
        centerPosition[1] - (Math.sin(newAngle) * length)
      ]
    }

    // Calculate robot position
    var robotPos = calcCoordinates(command.pose.position)
    var rotation = command.coordinates.unitRotation == "radians" ? command.pose.rotation : command.pose.rotation * (Math.PI / 180)
    if (robotRight) rotation += Math.PI
    var lengthPixels = pixelsPerInch * (command.coordinates.unitDistance == "inches" ? command.robot.size : command.robot.size * this.#inchesPerMeter)

    // Render trail
    if (command.pose.trail.length > 0) {
      var trailCoordinates = []
      var maxDistance = 0
      command.pose.trail.forEach(position => {
        var coordinates = calcCoordinates(position)
        trailCoordinates.push(coordinates)
        var distance = (((coordinates[0] - robotPos[0]) ** 2) + ((coordinates[1] - robotPos[1]) ** 2)) ** 0.5
        if (distance > maxDistance) maxDistance = distance
      })

      var gradient = context.createRadialGradient(robotPos[0], robotPos[1], lengthPixels * 0.5, robotPos[0], robotPos[1], maxDistance)
      gradient.addColorStop(0, "rgba(170, 170, 170, 1)")
      gradient.addColorStop(0.25, "rgba(170, 170, 170, 1)")
      gradient.addColorStop(1, "rgba(170, 170, 170, 0)")

      context.strokeStyle = gradient
      context.lineWidth = 1 * pixelsPerInch
      context.lineCap = "round"
      context.lineJoin = "round"
      context.beginPath()
      var firstPoint = true
      trailCoordinates.forEach(position => {
        if (firstPoint) {
          context.moveTo(position[0], position[1])
          firstPoint = false
        } else {
          context.lineTo(position[0], position[1])
        }
      })
      context.stroke()
    }

    // Render robot
    context.fillStyle = "#222"
    context.strokeStyle = command.robot.alliance
    context.lineWidth = 3 * pixelsPerInch
    var backLeft = transform([lengthPixels * -0.5, lengthPixels * -0.5], rotation, robotPos)
    var frontLeft = transform([lengthPixels * 0.5, lengthPixels * -0.5], rotation, robotPos)
    var frontRight = transform([lengthPixels * 0.5, lengthPixels * 0.5], rotation, robotPos)
    var backRight = transform([lengthPixels * -0.5, lengthPixels * 0.5], rotation, robotPos)
    context.beginPath()
    context.moveTo(frontLeft[0], frontLeft[1])
    context.lineTo(frontRight[0], frontRight[1])
    context.lineTo(backRight[0], backRight[1])
    context.lineTo(backLeft[0], backLeft[1])
    context.closePath()
    context.fill()
    context.stroke()

    context.strokeStyle = "white"
    context.lineWidth = 1 * pixelsPerInch
    var arrowBack = transform([lengthPixels * -0.3, 0], rotation, robotPos)
    var arrowFront = transform([lengthPixels * 0.3, 0], rotation, robotPos)
    var arrowLeft = transform([lengthPixels * 0.15, lengthPixels * -0.15], rotation, robotPos)
    var arrowRight = transform([lengthPixels * 0.15, lengthPixels * 0.15], rotation, robotPos)
    context.beginPath()
    context.moveTo(arrowBack[0], arrowBack[1])
    context.lineTo(arrowFront[0], arrowFront[1])
    context.moveTo(arrowLeft[0], arrowLeft[1])
    context.lineTo(arrowFront[0], arrowFront[1])
    context.lineTo(arrowRight[0], arrowRight[1])
    context.stroke()

    // Return target aspect ratio
    return fieldWidth / fieldHeight
  }
}