# Преобразование файлов Onshape и STEP в glTF {#converting-onshape-and-step-files-to-gltf}

3D-вид AdvantageScope принимает пользовательские модели для полей и роботов, которые можно установить с помощью процесса, описанного [здесь](/more-features/custom-assets). Все модели должны использовать формат файлов [glTF](https://www.khronos.org/gltf/), выбранный из-за его эффективности при хранении и загрузке моделей. Обратите внимание, что AdvantageScope использует двоичную форму (.glb), которая включает все ресурсы в один файл, а не чистую форму JSON (.gltf).

## Преобразование Onshape в STEP {#converting-onshape-to-step}

Хотя Onshape включает опцию экспорта в glTF, это часто приводит к очень большим файлам, которыми трудно управлять. Вместо этого рекомендуется экспортировать из Onshape в STEP, а затем следовать инструкциям в следующем разделе для преобразования в glTF.

1. После открытия файла Onshape щелкните правой кнопкой мыши по главной сборке и выберите «Export...»:

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Выбор параметра «Export...»" />

2. Во всплывающем окне опций убедитесь, что формат экспорта — «STEP», и нажмите «Export»:

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Всплывающее окно параметров экспорта" />

3. Дождитесь преобразования и скачивания файла. Это может занять несколько минут.

## Преобразование STEP в glTF {#converting-step-to-gltf}

1. Скачайте [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Это бесплатное приложение способно преобразовывать между многими 3D-форматами, включая STEP и glTF.

2. Откройте CAD Assistant и выберите файл STEP для преобразования:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Открытие файла STEP в CAD Assistant" />

3. Дождитесь импорта файла STEP. Это может занять несколько минут.

4. Нажмите иконку «Сохранить»:

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Нажатие на значок «Сохранить»" />

5. Выберите место для сохранения, затем используйте выпадающий список для переключения формата экспорта на «glb»:

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Переключение формата экспорта" />

6. Нажмите иконку шестеренки, затем включите «Merge faces within the same part»:

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Включение «Merge faces within the same part»" />

7. Нажмите иконку «Сохранить» и дождитесь завершения экспорта:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Нажатие на значок «Сохранить»" />
