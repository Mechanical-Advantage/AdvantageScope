---
sidebar_position: 2
---

# 🤖 Sahaya: Robot görselleştirme

Artık temel telemetri çalıştığına göre, robotunuzu görselleştirme zamanı! AdvantageScope; FRC ve FTC saha modellerinde odometriyi, görüntü işleme tahminlerini, yörüngeleri ve eklemli mekanizmaları hayata geçiren güçlü 2B ve 3B saha görüntüleyicileri sunar.

Bu eğitimde şunları öğreneceksiniz:

- **Telemetry API** kullanarak yapılandırılmış poz verileri yayınlama.
- Robot hareketini görselleştirmek için **🗺️ 2B saha** ve **👀 3B saha** sekmelerini kullanma.
- Hem 2B hem de 3B olarak bir mekanizmayı yayınlama ve işleme.

## 1. Pozları yayınlama

WPILib'de `Pose2d`, `Pose3d` ve `Translation2d` gibi geometri nesneleri robotun ve saha öğelerinin konumunu temsil etmek için kullanılır. **Telemetry API** ile pozları/ötelemeleri ve dizileri (planlanan yollar veya kamera hedefleri gibi) tek bir metot çağrısıyla doğrudan loglayabilirsiniz:

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

Telemetry.log("MyPose", poseA);
Telemetry.log("MyPoseArray", new Pose2d[] {poseA, poseB});
```

<details>
<summary>Örnek OpMode</summary>

Tam bir robot projesi olmadan AdvantageScope'un görselleştirme özelliklerini denemek ister misiniz? Bir FRC saha modelinde tanıtım amacıyla birkaç 2B ve 3B pozu yayınlayan aşağıdaki OpMode'u kopyalayın. Yeni bir WPILib projesi oluşturma ve telemetri için yapılandırma ayrıntıları için 👋 [Merhaba, Telemetri!](/tutorials/hello-telemetry) sayfasına bakın.

```java
@Teleop
public class ExampleTeleop implements OpMode {
  @Override
  public void periodic() {
    double t = Timer.getTimestamp();

    // Örnek bir dairesel sürüş yörüngesi oluşturun
    double x = 2.0 * Math.cos(t * 0.5);
    double y = 2.0 * Math.sin(t * 0.5);
    Rotation2d rotation = Rotation2d.fromRadians(t * 0.5 + Math.PI / 2.0);
    Pose2d robotPose2d = new Pose2d(x, y, rotation);

    // Örnek bir 3B poz oluşturun (ör. görüntü lokalizasyonundan veya jiroskop eğim/yuvarlanmasından)
    Pose3d robotPose3d = new Pose3d(x, y, 0.0, new Rotation3d(0.0, 0.0, rotation.getRadians()));

    // Örnek bir yörünge oluşturun (Pose2d nesnelerinden oluşan bir dizi)
    Pose2d[] trajectory = new Pose2d[] {
        new Pose2d(8.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 4.0, Rotation2d.ZERO),
        new Pose2d(10.0, 6.0, Rotation2d.CW_PI_2)
    };

    // Tekil 2B ve 3B pozları loglayın
    Telemetry.log("Field/RobotPose2d", robotPose2d);
    Telemetry.log("Field/RobotPose3d", robotPose3d);

    // Bir poz dizisi loglayın (ör. yörünge veya AprilTag pozları)
    Telemetry.log("Field/Trajectory", trajectory);
  }
}
```

</details>

AdvantageScope'ta kenar çubuğundaki geometri değerleri türleriyle etiketlenir. Ayrıca X, Y ve rotasyon değerleri gibi pozun tekil bileşenlerini incelemek için her alanı genişletebilirsiniz:

<img src="/img/tutorials/to-the-field-1.webp" alt="AdvantageScope kenar çubuğunda poz verilerini görüntüleme." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 2. 2B verileri görselleştirme

🗺️ [2B saha](/tab-reference/2d-field) sekmesi, robotunuzun yarışma sahası üzerindeki üstten görünümünü gösterir.

1. AdvantageScope'ta sekme çubuğundaki **+** düğmesine tıklayın ve **2B saha**yı seçin (veya mevcut bir 2B saha sekmesini seçin).
2. Alt kontrol panelindeki “Saha” açılır menüsünden mevcut oyun sezonunu veya standart bir sahayı seçin.
3. Kenar çubuğu ağacında `NT:/Telemetry/Field/RobotPose2d` alanını bulun ve kontrol panelindeki “Pozlar” listesine sürükleyin.
4. Robotunuz sahada görünecektir!
5. Robotun rengini değiştirmek için kontrol panelinde pozun yanındaki simgeye tıklayın.

:::info Kamera Kontrolleri

**Kilitsiz**, **Robota kilitli** (robotla birlikte kayar) veya **Robota ve rotasyona kilitli** (robotunuz her zaman yukarı bakacak şekilde sahayı döndürür) seçenekleri arasında seçim yapmak için saha tuvalinin herhangi bir yerine sağ tıklayın. Rotasyonu ayarlamak için “Yön” altındaki düğmelere tıklayın.
:::

<img src="/img/tutorials/to-the-field-2.webp" alt="2026 FRC sahasında robot görselleştirmesi." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 3. Nesne türlerini değiştirme

AdvantageScope; hayaletler (yarı saydam robotlar), yörüngeler, kamera hedefleri, ısı haritaları, AprilTag'ler, oyun objeleri ve daha fazlası dahil basit robot pozlarının ötesinde birçok görsel nesne türünü destekler! AdvantageScope'un hangi nesne türlerini işleyebileceğini keşfetmek için:

1. Kontrol panelinde bulunan `?` (Yardım) simgesine tıklayın.
2. Desteklenen tüm görsel türleri, beklenen veri türlerini (ör. `Pose2d`, `Pose3d[]`, `Translation2d`) ve bunların bağımsız öğeler olarak mı yoksa başka bir nesneye eklenen alt öğeler olarak mı eklenebileceğini listeleyen bir pencere açılır.

Nesne türünü değiştirmek için kontrol panelinde her pozun yanındaki simgeye tıklayın. Robot pozunu hayalet, ok veya ısı haritası gibi farklı bir nesne türüne değiştirmeyi deneyin!

<img src="/img/tutorials/to-the-field-3.webp" alt="2B saha için yerleşik yardım penceresi." height="500" />

_Yukarıda İngilizce arayüz gösteriliyor._

## 4. 3B verileri görselleştirme

👀 [3B saha](/tab-reference/3d-field) sekmesi oyun öğeleri, aydınlatma ve özelleştirilebilir robot modelleriyle eksiksiz bir 3B saha oluşturur.

1. Sekme çubuğunda **+** düğmesine tıklayın ve **3B saha**yı seçin (veya mevcut bir 3B saha sekmesini seçin).
2. “Saha” açılır menüsünden oyun sezonu modelinizi seçin.
3. `NT:/Telemetry/Field/RobotPose3d` veya `NT:/Telemetry/Field/RobotPose2d` alanını “Pozlar” bölümüne sürükleyin (2B pozlar otomatik olarak saha zeminine yerleştirilir).
4. `NT:/Telemetry/Field/Trajectory` alanını “Pozlar” listesine sürükleyin ve bir yolu saha boyunca bir şerit olarak göstermek için türünü **Yörünge** olarak ayarlayın.
5. Kamerayı saha etrafında döndürmek için **sol fare düğmesiyle** tıklayıp sürükleyin. Kaydırmak için **sağ fare düğmesiyle** sürükleyin. Yakınlaştırmak için kaydırın.
6. Alternatif olarak hareket etmek için **WASD**, döndürmek için **IJKL** ve yukarı/aşağı hareket etmek için **Q/E** tuşlarını kullanın.
7. **Robot etrafında dön**, **Sürücü İstasyonu** (maçı ittifakınızın perspektifinden izleyin) ve **Sabit Kamera** (robot üzerindeki görüntüleme kameralarından izleyin) arasında geçiş yapmak için 3B görünüm alanına sağ tıklayın.

<img src="/img/tutorials/to-the-field-4.webp" alt="Yörünge şeridiyle sahada ilerleyen 3B robot modelini işleyen 3B saha sekmesi." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 5. Mekanizma verilerini yayınlama

Robotunuzda asansör, kol veya bilek gibi eklemli yapılar varsa bunları WPILib'in `Mechanism2d` sınıfını kullanarak görselleştirebilirsiniz. Ayrıntılar için WPILib [belgelerine](https://docs.wpilib.org/tr/stable/docs/software/dashboards/glass/mech2d-widget.html) bakın. Aşağıda tek eklemli bir kol için örnek verilmiştir.

```java
public class ExampleTeleop implements OpMode {
  // 2B bir mekanizma tuvali oluşturun (genişlik 2 m, yükseklik 2 m)
  private final Mechanism2d mechanism = new Mechanism2d(2.0, 2.0);
  private MechanismLigament2d arm;

  public ExampleTeleop(Robot robot) {
    // (1 m, 0.5 m) konumunda kökü olan bir kol oluşturun
    MechanismRoot2d root = mechanism.getRoot("ArmRoot", 1.0, 0.5);
    arm = root.append(new MechanismLigament2d("Arm", 0.8, 0.0, 6.0, new Color8Bit(255, 100, 0)));
  }

  @Override
  public void periodic() {
    // Kol açısını canlandırın
    double angle = 45.0 + 45.0 * Math.sin(Timer.getTimestamp() * 2.0);
    arm.setAngle(angle);

    // Mekanizma durumunu her döngü periyodunda yayınlayın
    Telemetry.log("Superstructure/Mechanism", mechanism);
  }
}
```

## 6. Mekanizmaları 2B olarak görselleştirme

⚙️ [Mekanizma](/tab-reference/mechanism) sekmesi mekanizmaları 2B olarak görselleştirmek için kullanılabilir.

1. Sekme çubuğunda **+** düğmesine tıklayın ve **Mekanizma**yı seçin.
2. `NT:/Telemetry/Superstructure/Mechanism` alanını kontrol paneline sürükleyin. Canlandırılan 2B kolun gerçek zamanlı hareket ettiğini göreceksiniz.

<img src="/img/tutorials/to-the-field-5.webp" alt="2B eklemli kol görselleştirmesi gösteren Mekanizma sekmesi." />

_Yukarıda İngilizce arayüz gösteriliyor._

## 7. Mekanizmaları 3B olarak görselleştirme

Aynı `Mechanism2d` nesnesini doğrudan 3B saha sekmesindeki robotunuzun üzerine yansıtabilirsiniz!

1. 3B saha sekmesinde, robot pozunuzun “Pozlar” listesine eklendiğinden emin olun.
2. `NT:/Telemetry/Superstructure/Mechanism` alanını nesne listesindeki **robot pozu girişinin üzerine** (alt nesne olarak) sürükleyin.
3. 2B mekanizma, robot şasisi üzerinde 3B uzaya yansıtılır! **XZ** (yan profil) ve **YZ** (ön profil) düzlemleri arasında geçiş yapmak için mekanizmanın yanındaki dişli simgesine tıklayın.

<img src="/img/tutorials/to-the-field-6.webp" alt="3B robot modeline yansıtılmış bir mekanizmayı gösteren 3B saha sekmesi." />

_Yukarıda İngilizce arayüz gösteriliyor._

## Sırada ne var?

Artık robotunuzun hareketini ve mekanizmalarını 2B ve 3B olarak görselleştirebildiğinize göre:

- **🕹️ [Kontrolü Ele Alma: DS ve Joystickler](/tutorials/taking-control):** FIRST Driver Station ile nasıl entegre olunacağını, DS loglarıyla nasıl çalışılacağını ve kontrolcü girişlerinin nasıl görselleştirileceğini öğrenin.
- **👀 [3B saha](/tab-reference/3d-field):** Oyun objesi görselleştirme, kamera seçenekleri ve işleme modları dahil 3B saha sekmesi için kapsamlı bir rehber.
- **[AdvantageScope XR](/tab-reference/3d-field/advantagescope-xr):** iPhone ve iPad'de artırılmış gerçeklikle 3B saha görünümünü hayata geçirin.
- **🎬 [Video](/tab-reference/video):** Saha görselleştirmenizi gerçek maç görüntüleriyle yan yana karşılaştırın.
- **🦀 [Swerve](/tab-reference/swerve):** 2B ve 3B sahalardaki katmanlar dahil swerve sürüş mekanizmalarının durumunu görselleştirin.
- **⚙️ [Özel varlıklar](/more-features/custom-assets):** Özel CAD modelleri, eklemli mekanizmalar ve saha görselleri/modelleri ekleyin.
