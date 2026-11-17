# Onshape ve STEP dosyalarını glTF'ye dönüştürme {#converting-onshape-and-step-files-to-gltf}

AdvantageScope'un 3B görünümü, sahalar ve robotlar için özel modelleri destekler; bu modelleri [buradaki](/more-features/custom-assets) adımları izleyerek kurabilirsiniz. Tüm modeller, depolama ve yükleme verimliliği nedeniyle tercih edilen [glTF](https://www.khronos.org/gltf/) formatında olmalıdır. AdvantageScope'un saf JSON biçimi (.gltf) yerine, tüm kaynakları tek bir dosyada toplayan ikili biçimi (.glb) kullandığını unutmayın.

## Onshape'i STEP'e dönüştürme {#converting-onshape-to-step}

Onshape'te glTF dışa aktarma seçeneği bulunsa da bu genellikle yönetilmesi zor, çok büyük dosyalar oluşturur. Bunun yerine modeli Onshape'ten STEP olarak dışa aktarmanızı, ardından bir sonraki bölümdeki adımları izleyerek glTF'ye dönüştürmenizi öneririz.

1. Onshape dosyasını açtıktan sonra ana montaja sağ tıklayıp “Export...” seçeneğini seçin:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="“Export...” seçeneğini seçme" />

2. Seçenekler açılır penceresinde dışa aktarma formatının “STEP” olduğundan emin olun ve “Export” düğmesine tıklayın:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Dışa aktarma seçenekleri penceresi" />

3. Dosyanın dönüştürülüp indirilmesini bekleyin. Bu işlem birkaç dakika sürebilir.

## STEP'i glTF'ye dönüştürme {#converting-step-to-gltf}

1. [CAD Assistant](https://www.opencascade.com/products/cad-assistant/) uygulamasını indirin. Bu ücretsiz uygulama, STEP ve glTF dahil birçok 3B format arasında dönüşüm yapabilir.

2. CAD Assistant'ı açın ve dönüştüreceğiniz STEP dosyasını seçin:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="STEP dosyasını CAD Assistant'ta açma" />

3. STEP dosyasının içe aktarılmasını bekleyin. Bu işlem birkaç dakika sürebilir.

4. “Save” simgesine tıklayın:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="“Save” simgesine tıklama" />

5. Kaydedilecek konumu seçin, ardından açılır menüden dışa aktarma formatını “glb” yapın:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Dışa aktarma formatını değiştirme" />

6. Dişli simgesine tıklayıp “Merge faces within the same part” seçeneğini etkinleştirin:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="“Merge faces within the same part” seçeneğini etkinleştirme" />

7. “Save” simgesine tıklayın ve dışa aktarmanın bitmesini bekleyin:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="“Save” simgesine tıklama" />
