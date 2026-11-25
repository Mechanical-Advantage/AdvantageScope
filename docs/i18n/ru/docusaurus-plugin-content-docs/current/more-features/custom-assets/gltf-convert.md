# Преобразование файлов Onshape и STEP в glTF {#converting-onshape-and-step-files-to-gltf}

3D-вид AdvantageScope принимает пользовательские модели для полей и роботов, которые можно установить с помощью процесса, описанного [здесь](/more-features/custom-assets). Все модели должны использовать двоичный формат файлов [glTF](https://www.khronos.org/gltf/) (`.glb`), выбранный за небольшой размер файлов и быструю загрузку.

:::info
Файлы glTF существуют в двух форматах: JSON (`.gltf`) и двоичном (`.glb`). AdvantageScope требует двоичный формат **`.glb`**, который объединяет все данные модели в одном файле.
:::

## Преобразование Onshape в STEP {#converting-onshape-to-step}

Хотя Onshape включает опцию экспорта в glTF, это часто приводит к очень большим файлам, которыми трудно управлять. Вместо этого рекомендуется экспортировать из Onshape в STEP, а затем следовать инструкциям в следующем разделе для преобразования в двоичный glTF (`.glb`).

1. После открытия файла Onshape щёлкните правой кнопкой мыши по главной сборке и выберите «Export...»:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Выбор параметра «Export...»" />

2. Во всплывающем окне параметров убедитесь, что формат экспорта — «STEP», и нажмите «Export»:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Всплывающее окно параметров экспорта" />

3. Дождитесь преобразования и скачивания файла. Это может занять несколько минут.

## Преобразование STEP в glTF (.glb) {#converting-step-to-gltf}

1. Скачайте [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Это бесплатное приложение способно преобразовывать между многими 3D-форматами, включая STEP и glTF (`.glb`).

2. Откройте CAD Assistant и выберите файл STEP для преобразования:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Открытие файла STEP в CAD Assistant" />

3. Дождитесь импорта файла STEP. Это может занять несколько минут.

4. Нажмите иконку «Сохранить»:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Нажатие на значок «Сохранить»" />

5. Выберите место для сохранения, затем используйте выпадающий список для переключения формата экспорта на «glb» (двоичный glTF):

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Переключение формата экспорта" />

6. Нажмите иконку шестерёнки, затем включите «Merge faces within the same part»:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Включение «Merge faces within the same part»" />

7. Нажмите иконку «Сохранить» и дождитесь завершения экспорта:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Нажатие на значок «Сохранить»" />

После экспорта переименуйте файл `.glb` (например, в `model.glb`) и добавьте его в папку пользовательских ресурсов, как описано на странице [Пользовательские ресурсы](/more-features/custom-assets).
