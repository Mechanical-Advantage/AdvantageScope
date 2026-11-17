# ⚙️ Özel varlıklar {#custom-assets}

AdvantageScope; düz saha görselleri, saha modelleri, robot modelleri ve joystick yapılandırmalarından oluşan varsayılan bir varlık setiyle gelir. Temel varlıklar (örneğin genel amaçlı sahalar) ilk kurulumla birlikte gelir. Sezona özel sahalar gibi detaylı varlıklar ise AdvantageScope internete bağlıyken arka planda otomatik olarak indirilir. Bu indirmelerin durumunu kontrol etmek için `Uygulama`/`AdvantageScope` > `Varlık indirme durumu...` seçeneğine tıklayın.

İsterseniz bu seti özelleştirip kendi varlıklarınızı ekleyebilirsiniz. Kullanıcı varlıkları klasörünü açmak için `Uygulama`/`AdvantageScope` > `Varlıklar klasörünü göster` seçeneğine tıklayın. Varlıklar için beklenen formatlar aşağıda tanımlanmıştır. Örnek olarak varsayılan [detaylı varlıklara](https://github.com/Mechanical-Advantage/AdvantageScopeAssets/releases) ve [dahili varlıklara](https://github.com/Mechanical-Advantage/AdvantageScope/tree/main/bundledAssets) göz atabilirsiniz.

:::tip
Varlıkları alternatif bir konumdan yüklemek için `Uygulama`/`AdvantageScope` > `Özel varlıklar klasörünü kullan` seçeneğine tıklayın. Seçtiğiniz klasör, her varlığın kendi alt klasöründe bulunduğu _üst klasör_ olmalıdır. Bu sayede özel varlıklarınızı robot koduyla birlikte sürüm kontrolü altında tutabilirsiniz.
:::

## Genel format {#general-format}

Tüm varlıklar “TÜR_AD” biçiminde adlandırılmış klasörlerde saklanır. Klasör adındaki AD kısmı AdvantageScope'ta görünmez. Kullanabileceğiniz varlık türleri şunlardır:

- “Field2d”
- “Field3d”
- “Robot”
- “Joystick”

:::info
Örnek klasör adları “Field2d_2023Field”, “Joystick_OperatorButtons” veya “Robot_Dozer” olabilir.
:::

Bu klasörde aşağıda anlatıldığı gibi “config.json” dosyası ile bir veya daha fazla varlık dosyası bulunmalıdır. Yapılandırma dosyasında her zaman AdvantageScope'un ekranda göstereceği varlık adı yer alır. Bu ad, kendi varlık türü içinde benzersiz olmalıdır. İsterseniz dil kodlarını (örn. “es-419”, “fr”, “zh-CN”) çevrilmiş adlarla eşleyen bir “locales” nesnesi de ekleyebilirsiniz. Seçilen dil için çeviri yoksa veya “locales” eklenmemişse kök düzeydeki “name” alanı varsayılan ad olarak kullanılır.

```json
{
  "name": string, // Benzersiz varsayılan ad, tüm varlık türleri için gereklidir
  "locales": { [locale: string]: string } // Dil kodlarını (örn. "en-US", "fr") çevirilere eşleyen isteğe bağlı yerelleştirilmiş adlar
  ... // Tür bağımlı yapılandırma, aşağıda açıklanmıştır
}
```

## 3B robot modelleri {#3d-robot-models}

### Video anlatımı {#video-tutorial}

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/unX1PsPi0VA" title="Configuring Custom Robot Models for AdvantageScope" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Genel bakış {#overview}

Klasörde “model.glb” adında bir model dosyası bulunmalıdır. CAD dosyalarını glTF formatına dönüştürmeniz gerekir; detaylar için [bu sayfaya](gltf-convert) bakın. Yapılandırma dosyası şu yapıda olmalıdır:

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  "locales": { [locale: string]: string } // Varlık adı için isteğe bağlı çeviriler
  "isFTC": boolean // Modelin FRC sahaları yerine FTC sahalarında kullanılmasının amaçlanıp amaçlanmadığı (varsayılan "false")
  "disableSimplification": boolean // Model basitleştirmesinin devre dışı bırakılıp bırakılmayacağı, isteğe bağlı
  "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
  "position": [number, number, number] // Metre cinsinden konum offset'i, rotasyondan sonra uygulanır
  "cameras": [ // Sabit kamera konumları, boş olabilir
    {
      "name": string // Kamera adı
      "locales": { [locale: string]: string } // Kamera adı için isteğe bağlı çeviriler
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
      "position": [number, number, number] // Robota göre metre cinsinden konum offset'i, rotasyondan sonra uygulanır
      "resolution": [number, number] // Piksel cinsinden çözünürlük, sabit en boy oranını ayarlamak için kullanılır
      "fov": number // Derece cinsinden yatay görüş alanı
    }
  ],
  "components": [...] // “Eklemli bileşenler” bölümüne bakın
}
```

Uygun konum ve rotasyon değerlerini belirlemenin en basit yolu deneme yanılma yöntemidir. Dönüşümler bu sırayla uygulandığı için konumdan önce rotasyonu ayarlamanızı öneririz.

:::info
AdvantageScope, performansı artırmak için model geometrisini seçilen [işleme moduna](/tab-reference/3d-field#rendering-modes) bağlı bir detay seviyesine göre otomatik olarak basitleştirir. Bu işlem özel varlıklarda istenmeyen sonuçlara yol açarsa iki yöntemden birini kullanabilirsiniz:

- Belirli bir mesh'in otomatik olarak kaldırılmasını engellemek için mesh adına `NOSIMPLIFY` ifadesini ekleyin.
- Tüm robot modeli için basitleştirmeyi kapatmak istiyorsanız yapılandırmadaki `disableSimplification` seçeneğini `true` yapın.

:::

### Eklemli bileşenler {#articulated-components}

:::warning
Eklemli bileşenleri ayarlamak karmaşık ve zaman alıcı olabilir. Bunun yerine, **3B sahada mekanizmaları görselleştirmek** için daha pratik bir yaklaşım sunan AdvantageScope'un 3B [`Mechanism2d` desteğini](/tab-reference/3d-field#2d-mechanisms) kullanmayı düşünebilirsiniz.
:::

Robot modelleri, mekanizma verilerini görselleştirmek için eklemli bileşenler içerebilir (detaylar için [buraya](/tab-reference/3d-field) bakın). Ana glTF modeli bu bileşenleri içermemeli, her bileşen ayrı bir glTF modeli olarak dışa aktarılmalıdır. Bileşen modelleri “model_İNDEKS.glb” kuralına göre adlandırılır; yani ilk eklemli bileşenin adı “model_0.glb” olur.

Bileşen ayarları robotun yapılandırma dosyasındaki “components” dizisinde tanımlanır. AdvantageScope'ta herhangi bir bileşen pozu verilmediğinde, bileşen modelleri robotun varsayılan rotasyon ve konum değerlerine göre yerleştirilir (yukarıya bakın). Bileşen pozları verildiğinde ise önce her bileşeni robot orijinine getirmek için “sıfırlanmış” rotasyonlar ve konum uygulanır; ardından verdiğiniz pozlar kullanılarak her bileşen robottaki doğru yerine taşınır.

:::tip
3B bileşenleri robota göre konumlandırırken koordinat sisteminin orijini robotun yayınlanan pozuyla eşleşir. Tipik 2B robot hareketlerinde bu pozun genellikle sıfır yüksekliği, yani robotun alt sacını (bellypan) DEĞİL, doğrudan zemin düzlemini temel aldığını unutmayın.
:::

```json
"components": [
  {
    "zeroedRotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
    "zeroedPosition": [number, number, number] // Robota göre metre cinsinden konum offset'i, rotasyondan sonra uygulanır
  }
]
```

#### Kurulum süreci {#setup-process}

Eklemli bileşenlerin konumlarını kalibre etmek için şu adımları izlemenizi öneririz:

1. Ana modeli ve bileşenleri doğru “varsayılan” konumlarında dışa aktarın. AdvantageScope'ta bileşen pozu verilmediğinde modeller bu konumda görünür.

2. Robot kodundan sıfırlanmış bir 2B poz yayınlayın ve bunu AdvantageScope'ta robot pozu olarak seçin. Saha orijinini görmek için 3B saha olarak “Eksenler” seçeneğine geçin.

3. Tüm robot doğru yönlenene kadar robotun genel rotasyonlarını (bileşenlerin değil) ayarlayın. Ardından tüm robotu orijine getirmek için genel konumu ayarlayın. Bu sırada bileşenler aynı varsayılan konumlarında kalmalıdır.

4. Robot kodundan modeldeki bileşen sayısı kadar sıfırlanmış 3B poz içeren bir dizi yayınlayın ve bunu AdvantageScope'ta bileşen pozları olarak seçin.

5. Her bileşen için önce rotasyonları, sonra konumları orijine hizalanana kadar ayarlayın. Örneğin bir kol parçası, X ekseni boyunca ileri doğru uzanacak şekilde dönme ekseninden orijine hizalanmalıdır.

6. Robot kodundan, her bileşen için yeni tanımladığınız bu orijinleri temel alan gerçek bileşen pozlarını yayınlayın. Örneğin bir kol parçasının pozu, kolun eklem noktasında ve parçanın baktığı yöne doğru konumlandırılır.

## Joystickler {#joysticks}

Klasörde “image.png” adında bir görsel bulunmalıdır. Yapılandırma dosyası şu yapıda olmalıdır:

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  "locales": { [locale: string]: string } // Varlık adı için isteğe bağlı çeviriler
  "components": [...] // Bileşen yapılandırmaları dizisi, aşağıya bakın
}
```

:::info
Düğmeler, joystickler ve eksen değerleri hem [SDL](https://www.libsdl.org) bağlamalarını (mevcut FIRST Sürücü İstasyonu'nun kullandığı) hem de NI bağlamalarını (eski NI FRC Sürücü İstasyonu'nun kullandığı) destekler. Her bileşen için en az bir bağlama seti tanımlanmalıdır.

NI bağlamaları için AdvantageScope, ön eksiz eski yapılandırma anahtarlarıyla (örneğin `sourceIndex`) geriye dönük uyumludur. **Tüm yeni joystickler, mevcut FIRST Sürücü İstasyonu ile uyumlu olması için açık SDL bağlamalarını (örneğin `sdlSourceIndex`) kullanmalıdır.**
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

Klasörde “image.png” adında bir görsel bulunmalıdır. Görsel, kırmızı ittifak solda olacak şekilde yönlendirilmelidir. Yapılandırma dosyası şu yapıda olmalıdır:

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  "locales": { [locale: string]: string } // Varlık adı için isteğe bağlı çeviriler
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

Klasörde “model.glb” adında bir model bulunmalıdır. Tüm rotasyonlar uygulandıktan sonra saha, kırmızı ittifak solda kalacak şekilde yönlendirilmelidir. CAD dosyaları glTF formatına dönüştürülmelidir; detaylar için [bu sayfaya](gltf-convert) bakın. Oyun objesi modelleri “gamePieces” dizisindeki sıraya göre “model_İNDEKS.glb” kuralıyla adlandırılır. Burada tanımlanan AprilTag'ler, diğer yapılandırma ayarlarından bağımsız olarak her zaman [merkez/kırmızı](/more-features/coordinate-systems#center-red) koordinat sistemine göre konumlandırılır.

Yapılandırma dosyası şu yapıda olmalıdır:

```json
{
  "name": string // Benzersiz ad, tüm varlık türleri için gereklidir
  "locales": { [locale: string]: string } // Varlık adı için isteğe bağlı çeviriler
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
      "locales": { [locale: string]: string } // Oyun objesi adı için isteğe bağlı çeviriler
      "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
      "position": [number, number, number] // Metre cinsinden konum offset'i, rotasyondan sonra uygulanır
      "stagedObjects": string[] // Sahaya yerleştirilmiş oyun objesi nesnelerinin adları, kullanıcı pozları sağlanırsa gizlenecek
    },
    ...
  ],
  "aprilTags": [ // Ek AprilTag modellerinin listesi (saha modelinin parçası değilse)
    "variant": string // "FAMILY-SIZEin" olarak formatlayın; burada "FAMILY" "36h11" veya "16h5" ve "SIZE" siyah bölümün uzunluğudur
    "id": number
    "rotations": { "axis": "x" | "y" | "z", "degrees": number }[] // x, y ve z eksenleri boyunca rotasyon dizisi
    "position": [number, number, number] // Metre cinsinden konum offset'i, rotasyondan sonra uygulanır
  ]
}
```
