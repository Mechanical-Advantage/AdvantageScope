# ⚙️ Özel varlıklar {#custom-assets}

AdvantageScope düz saha görselleri, saha modelleri, robot modelleri ve joystick yapılandırmalarından oluşan varsayılan bir küme kullanır. Basit varlıklar (örneğin evergreen sahaları) ilk kuruluma dahildir. Detaylı varlıklar (örneğin sezona özel sahalar), AdvantageScope internete bağlı olduğunda arka planda otomatik olarak indirilir. Bu indirmelerin durumunu kontrol etmek için `Uygulama`/`AdvantageScope` > `Varlık indirme durumu...` seçeneğine tıklayın.

Varlık kümesi istenirse daha fazla seçenek eklemek üzere özelleştirilebilir. Kullanıcı varlıkları klasörünü açmak için `Uygulama`/`AdvantageScope` > `Varlıklar klasörünü göster` seçeneğine tıklayın. Varlıklar için beklenen formatlar aşağıda tanımlanmıştır. Referans için varsayılan [detaylı varlıklar](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) ve [dahili varlıklar](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) kümesine bakın.

:::tip
Varlıkları alternatif bir konumdan yüklemek için `Uygulama`/`AdvantageScope` > `Özel varlıklar klasörünü kullan` seçeneğine tıklayın. Seçilen klasör, ayrı alt klasörlerde birden fazla varlığın yerleştirilebileceği _üst klasör_ olmalıdır. Bu özellik, özel varlıklarin robot koduyla birlikte sürüm kontrolü altında saklanmasına olanak tanır.
:::

## Genel format {#general-format}

Tüm varlıklar "TÜR_AD" adlandırma kuralına sahip klasörlerde saklanır. Klasör için kullanılan AD, AdvantageScope tarafından görüntülenmez. Olası varlık türleri şunlardır:

- "Field2d"
- "Field3d"
- "Robot"
- "Joystick"

:::info
Örnek klasör adları "Field2d_2023Field", "Joystick_OperatorButtons" veya "Robot_Dozer" olabilir.
:::

Bu klasör aşağıda açıklandığı gibi "config.json" adlı bir dosya ve bir veya daha fazla varlık dosyası içermelidir. Yapılandırma dosyası her zaman AdvantageScope tarafından görüntülenecek varlığın adını içerir. Bu ad her varlık türü için benzersiz olmalıdır.

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  ... // Tür bağımlı yapılandırma, aşağıda açıklanmıştır
}
```

## 3B robot modelleri {#3d-robot-models}

### Video öğreticisi {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Genel bakış {#overview}

Klasörde "model.glb" adında bir model bulunmalıdır. CAD dosyaları glTF formatına dönüştürülmelidir; ayrıntılar için [bu sayfaya](gltf-convert) bakın. Yapılandırma dosyası aşağıdaki formatta olmalıdır:

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  "isFTC": boolean // Modelin FRC sahaları yerine FTC sahalarında kullanılmasının amaçlanıp amaçlanmadığı (varsayılan "false")
  "disableSimplification": boolean // Model basitleştirmesinin devre dışı bırakılıp bırakılmayacağı, isteğe bağlı
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
  "position": [number, number, number] // Metre cinsinden konum offseti, rotasyondan sonra uygulanır
  "cameras": [ // Sabit kamera konumları, boş olabilir
    {
      "name": string // Kamera adı
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
      "position": [number, number, number] // Robota göre metre cinsinden konum offseti, rotasyondan sonra uygulanır
      "resolution": [number, number] // Piksel cinsinden çözünürlük, sabit en boy oranını ayarlamak için kullanılır
      "fov": number // Derece cinsinden yatay görüş alanı
    }
  ],
  "components": [...] // "Eklemli Bileşenler" bölümüne bakın
}
```

Uygun konum ve rotasyon değerlerini belirlemenin en basit yolu deneme yanılma yöntemidir. Dönüşümler bu sırayla uygulandığı için konumdan önce rotasyonu ayarlamanızı öneririz.

:::info
AdvantageScope, detay seviyesinin seçilen [işleme moduna](/tab-reference/3d-field#rendering-modes) bağlı olduğu durumlarda performansı artırmak için model geometrisini otomatik olarak basitleştirir. Model basitleştirmesinin özel varlıklarle istenmeyen etkilere yol açtığı durumlarda iki çözüm kullanılabilir:

- Belirli bir mesh'in otomatik olarak kaldırılmasını devre dışı bırakmak için mesh adına `NOSIMPLIFY` dizesini dahil edin.
- Tüm bir robot modeli için model basitleştirmesini devre dışı bırakmak için yapılandırmadaki `disableSimplification` seçeneğini `true` olarak ayarlayın.

:::

### Eklemli bileşenler {#articulated-components}

:::warning
Eklemli bileşenlerin kurulumu karmaşık ve zaman alıcı olabilir. **3B sahada mekanizmaları görselleştirmek** için daha kolaylaştırılmış bir yaklaşım sunan AdvantageScope'un 3B [`Mechanism2d` desteğini](/tab-reference/3d-field#2d-mechanisms) kullanmayı düşünün.
:::

Robot modelleri mekanizma verilerini görselleştirmek için eklemli bileşenler içerebilir (ayrıntılar için [buraya](/tab-reference/3d-field) bakın). Temel glTF modeli bileşen içermemelidir, ardından her bileşen ayrı bir glTF modeli olarak dışa aktarılmalıdır. Bileşen modelleri "model_DİZİN.glb" adlandırma kuralını izler, dolayısıyla ilk eklemli bileşen "model_0.glb" olacaktır.

Bileşen yapılandırması robotun yapılandırma dosyasında sağlanır. "components" anahtarı altında bir bileşen dizisi sağlanmalıdır. AdvantageScope'ta kullanıcı tarafından hiçbir bileşen pozu sağlanmadığında, bileşen modelleri varsayılan robot rotasyonları ve konumu kullanılarak konumlandırılacaktır (yukarıya bakın). Kullanıcı tarafından bileşen pozları sağlandığında, her bileşeni robot orijinine getirmek için "sıfırlanmış" rotasyonlar ve konum uygulanır. Kullanıcının pozları daha sonra her bileşeni robottaki doğru konuma taşımak için uygulanır.

:::tip
3B bileşenleri robota göre konumlandırırken koordinat sisteminin orijini robotun yayınlanan pozuyla eşleşir. Bu pozun genellikle sıfır yüksekliğini kullandığını unutmayın, bu da taban düzlemidir ve robotun taban plakası DEĞİLDİR (tipik 2B robot hareketi için).
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
    "zeroedPosition": [number, number, number] // Robota göre metre cinsinden konum offseti, rotasyondan sonra uygulanır
  }
]
```

#### Kurulum süreci {#setup-process}

Eklemli bileşenlerin konumlarını kalibre etmek için aşağıdaki süreci öneririz:

1. Temel modeli ve bileşenleri doğru "varsayılan" konumlarında dışa aktarın. AdvantageScope'ta hiçbir bileşen pozu sağlanmamışsa bu şekilde işlenmelidirler.

2. Robot kodundan sıfırlanmış bir 2B poz yayınlayın, ardından AdvantageScope'ta robot pozu olarak seçin. Saha orijinini gösteren "Eksenler" 3B sahasına geçin.

3. Tüm robot doğru yönlendirilene kadar robotun genel rotasyonlarını (bileşenlerin değil) ayarlayın. Ardından tüm robotu orijine getirmek için genel konumu ayarlayın. Bileşenler bu süreç boyunca aynı varsayılan konumlarda işlenmelidir.

4. Robot kodundan modeldeki bileşen sayısıyla eşleşen sıfırlanmış 3B pozlardan oluşan bir dizi yayınlayın, ardından AdvantageScope'ta bileşen pozları kümesi olarak seçin.

5. Her bileşen için rotasyonları ve ardından konumları orijine hizalanana kadar ayarlayın. Örneğin bir kol segmenti, X ekseni boyunca ileri doğru yönlendirilmişken orijindeki pivot ile hizalanacaktır.

6. Robot kodundan her bileşen için yeni tanımlanan orijinlere dayalı olacak gerçek bileşen pozlarını yayınlayın. Örneğin bir kol segmentinin pozu, segment yönünde yönlendirilmiş kol ekleminde konumlandırılacaktır.

## Joystickler {#joysticks}

Klasörde "image.webp" adında bir görsel bulunmalıdır. Yapılandırma dosyası aşağıdaki formatta olmalıdır:

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  "components": [...] // Bileşen yapılandırmaları dizisi, aşağıya bakın
}
```

:::info
Düğmeler, joystickler ve eksen değerleri hem [SDL](https://www.libsdl.org) bağlamalarını (mevcut FIRST Sürücü İstasyonu tarafından kullanılır) hem de NI bağlamalarını (eski NI FRC Sürücü İstasyonu tarafından kullanılır) destekler. Her bileşen için en az bir bağlama kümesi sağlanmalıdır.

NI bağlamaları için AdvantageScope eski ön eksiz yapılandırma anahtarlarıyla (örneğin `sourceIndex`) geriye dönük uyumludur. **Tüm yeni joystickler, mevcut FIRST Sürücü İstasyonu ile uyumluluk için açık SDL bağlamaları (örneğin `sdlSourceIndex`) kullanmalıdır.**
:::

### Tek düğme / POV değeri {#single-button-pov-value}

```json
{
  "type": "button"
  "isYellow": boolean
  "isEllipse": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number
  "sdlSourcePov": string // İsteğe bağlı, "up", "right", "down" veya "left" olabilir. Sağlanırsa "sdlSourceIndex" okunacak POV'un dizini olacaktır.

  // NI Sürücü İstasyonu için alternatif bağlamalar (isteğe bağlı)
  "niSourceIndex": number
  "niSourcePov": string
}
```

### İki eksenli joystick {#two-axis-joystick}

```json
{
  "type": "joystick" // İki boyutta hareket eden bir joystick
  "isYellow": boolean
  "centerPx": [number, number]
  "radiusPx": number
  "sdlXSourceIndex": number
  "sdlXSourceInverted": boolean // Ters çevrilmemiş: sağ = pozitif
  "sdlYSourceIndex": number
  "sdlYSourceInverted": boolean // Ters çevrilmemiş: yukarı = pozitif
  "sdlButtonSourceIndex": number // İsteğe bağlı

  // NI Sürücü İstasyonu için alternatif bağlamalar (isteğe bağlı)
  "niXSourceIndex": number
  "niXSourceInverted": boolean
  "niYSourceIndex": number
  "niYSourceInverted": boolean
  "niButtonSourceIndex": number
}
```

### Tek eksen {#single-axis}

```json
{
  "type": "axis" // Tek bir eksen değeri
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
  "sdlSourceRange": [number, number] // Ters çevirmek için min değerinin max değerinden büyük olması gerekir

  // NI Sürücü İstasyonu için alternatif bağlamalar (isteğe bağlı)
  "niSourceIndex": number,
  "niSourceRange": [number, number]
}
```

### Dokunmatik yüzey {#touchpad}

```json
{
  "type": "touchpad" // Bir dokunmatik yüzey
  "isYellow": boolean
  "centerPx": [number, number]
  "sizePx": [number, number]
  "sdlSourceIndex": number,
}
```

## Düz saha görselleri {#flat-field-images}

Klasörde "image.webp" adında bir görsel bulunmalıdır. Kırmızı ittifak solda olacak şekilde yönlendirilmelidir. Yapılandırma dosyası aşağıdaki formatta olmalıdır:

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  "isFTC": boolean // Bunun bir FRC sahası yerine bir FTC sahası olup olmadığı
  "coordinateSystem": // Kullanılacak varsayılan koordinat sistemi (aşağıya bakın)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC geleneksel
      "center-red"       // Systemcore
  "useGrid": boolean // Bu saha bir FTC sahasıysa ızgara çizgilerinin işlenip işlenmeyeceği (varsayılan "true")
  "sourceUrl": string // Orijinal dosyaya bağlantı, isteğe bağlı
  "topLeft": [number, number] // Piksel koordinatı (orijin sol üstte)
  "bottomRight": [number, number] // Piksel koordinatı (orijin sol üstte)
  "widthInches": number // Sahanın gerçek genişliği (uzun kenar)
  "heightInches": number // Sahanın gerçek yüksekliği (kısa kenar)
}
```

## 3B saha modelleri {#3d-field-models}

Klasörde "model.glb" adında bir model bulunmalıdır. Tüm rotasyonlar uygulandıktan sonra saha kırmızı ittifak solda olacak şekilde yönlendirilmelidir. CAD dosyaları glTF formatına dönüştürülmelidir; ayrıntılar için [bu sayfaya](gltf-convert) bakın. Oyun objesi modelleri "gamePieces" dizisinde görünme sırasına göre "model_DİZİN.glb" adlandırma kuralını izler. Burada bildirilen AprilTag'ler diğer yapılandırma seçeneklerinden bağımsız olarak her zaman bir [merkez/kırmızı](/more-features/coordinate-systems#center-red) koordinat sistemi kullanılarak konumlandırılır.

Yapılandırma dosyası aşağıdaki formatta olmalıdır:

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  "isFTC": boolean // Bunun bir FRC sahası yerine bir FTC sahası olup olmadığı
  "coordinateSystem": // Kullanılacak varsayılan koordinat sistemi (aşağıya bakın)
      "wall-alliance" |  // FRC 2022
      "wall-blue" |      // FRC 2023-2026
      "center-rotated" | // FTC geleneksel
      "center-red"       // Systemcore
  "useGrid": boolean // Bu saha bir FTC sahasıysa ızgara çizgilerinin işlenip işlenmeyeceği (varsayılan "true")
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
  "widthInches": number // Sahanın gerçek genişliği (uzun kenar)
  "heightInches": number // Sahanın gerçek yüksekliği (kısa kenar)
  "defaultOrigin": "auto" | "blue" | "red" // Varsayılan orijin konumu, belirtilmemişse "auto"
  "driverStations": [
    [number, number] // Sürücü İstasyonu konumları (sahanın merkezine göre metre cinsinden X ve Y)
    ...              // FRC için [B1, B2, B3, R1, R2, R3] olarak sıralanmış 6 eleman. FTC için [BL, BR, RL, RR] olarak sıralanmış 4 eleman.
  ]
  "gamePieces": [ // Oyun objesi türlerinin listesi
    {
      "name": string // Oyun objesi adı
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
      "position": [number, number, number] // Metre cinsinden konum offseti, rotasyondan sonra uygulanır
      "stagedObjects": string[] // Sahaya yerleştirilmiş oyun objesi nesnelerinin adları, kullanıcı pozları sağlanırsa gizlenecek
    },
    ...
  ],
  "aprilTags": [ // Ek AprilTag modellerinin listesi (saha modelinin parçası değilse)
    "variant": string // "FAMILY-SIZEin" olarak formatlayın; burada "FAMILY" "36h11" veya "16h5" ve "SIZE" siyah bölümün uzunluğudur
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
    "position": [number, number, number] // Metre cinsinden konum offseti, rotasyondan sonra uygulanır
  ]
}
```
