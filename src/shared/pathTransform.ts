export class PathTransformer {
  private static readonly AKIT_PREFIX = "/AdvantageKit";
  private static readonly NT4_PREFIX = "NT:";

  static transformPaths(
    paths: string[],
    fromMode: string,
    toMode: string
  ): string[] {
    return paths.map(path => this.transformPath(path, fromMode, toMode));
  }

  static transformPath(
    path: string,
    fromMode: string,
    toMode: string
  ): string {
    if (fromMode === toMode) return path;

    let transformedPath = path;

    // Replace NT4 prefix with AdvantageKit
    if (fromMode === "nt4" && (toMode === "rlog" || toMode === "nt4-akit")) {
      if (path.startsWith("NT:/AdvantageKit")) {
        transformedPath = path.substring("NT:/AdvantageKit".length);
      }
    }
    
    // Replace AdvantageKit with NT4 prefix
    else if ((fromMode === "rlog" || fromMode === "nt4-akit") && toMode === "nt4") {
      if (!path.startsWith("NT:/AdvantageKit")) {
        transformedPath = "NT:/AdvantageKit" + path;
      }
    }
    
    // Use same format
    else if ((fromMode === "rlog" || fromMode === "nt4-akit") && 
             (toMode === "rlog" || toMode === "nt4-akit")) {
      transformedPath = path;
    }

    return transformedPath;
  }
}