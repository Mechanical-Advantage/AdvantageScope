# Onshape ve STEP dosyalarını glTF'ye dönüştürme {#converting-onshape-and-step-files-to-gltf}

AdvantageScope'un 3B görünümü, [burada](/more-features/custom-assets) açıklanan süreç kullanılarak kurulabilen sahalar ve robotlar için özel modelleri kabul eder. Tüm modeller, modelleri saklarken ve yüklerken verimliliği nedeniyle seçilen [glTF](https://www.khronos.org/gltf/) dosya formatını kullanmalıdır. AdvantageScope'un saf JSON formu (.gltf) yerine tüm kaynakları tek bir dosyada içeren ikili formu (.glb) kullandığını unutmayın.

## Onshape'i STEP'e dönüştürme {#converting-onshape-to-step}

Onshape, glTF için bir dışa aktarma seçeneği içerse de bu genellikle yönetilmesi zor çok büyük dosyalar üretir. Bunun yerine Onshape'ten STEP'e dışa aktarılması, ardından glTF'ye dönüştürmek için bir sonraki bölümdeki talimatların izlenmesi önerilir.

1. Onshape dosyasını açtıktan sonra ana montaja sağ tıklayın ve "Export..." seçeneğini seçin:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="&quot;Export...&quot; seçeneğini seçme" />

2. Seçenekler açılır penceresinde dışa aktarma formatının "STEP" olduğundan emin olun ve "Export" seçeneğine tıklayın:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Dışa aktarma seçenekleri penceresi" />

3. Dosyanın dönüştürülmesini ve indirilmesini bekleyin. Bu birkaç dakika sürebilir.

## STEP'i glTF'ye dönüştürme {#converting-step-to-gltf}

1. [CAD Assistant](https://www.opencascade.com/products/cad-assistant/) uygulamasını indirin. Bu ücretsiz uygulama, STEP ve glTF dahil birçok 3B format arasında dönüşüm yapabilir.

2. CAD Assistant'ı açın ve dönüştürülecek STEP dosyasını seçin:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="STEP dosyasını CAD Assistant içinde açma" />

3. STEP dosyasının içe aktarılmasını bekleyin. Bu birkaç dakika sürebilir.

4. "Save" simgesine tıklayın:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="&quot;Kaydet&quot; simgesine tıklama" />

5. Bir kaydetme konumu seçin, ardından dışa aktarma formatını "glb" olarak değiştirmek için açılır menüyü kullanın:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Dışa aktarma biçيميني değiştirme" />

6. Dişli simgesine tıklayın, ardından "Merge faces within the same part" seçeneğini etkinleştirin:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="&quot;Merge faces within the same part&quot; seçeneğini etkinleştirme" />

7. "Save" simgesine tıklayın ve dışa aktarmanın bitmesini bekleyin:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="&quot;Kaydet&quot; simgesine tıklama" />
