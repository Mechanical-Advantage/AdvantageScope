# Convertendo arquivos Onshape e STEP para glTF {#converting-onshape-and-step-files-to-gltf}

A visualização 3D do AdvantageScope aceita modelos personalizados para campos e robôs, que podem ser instalados usando o processo descrito [aqui](/more-features/custom-assets). Todos os modelos devem usar o formato de arquivo [glTF](https://www.khronos.org/gltf/), escolhido por sua eficiência ao armazenar e carregar modelos. Observe que o AdvantageScope usa a forma binária (.glb), que inclui todos os recursos em um único arquivo, em vez da forma JSON pura (.gltf).

## Convertendo Onshape para STEP {#converting-onshape-to-step}

Embora o Onshape inclua uma opção de exportação para glTF, isso frequentemente produz arquivos muito grandes que são difíceis de gerenciar. Em vez disso, recomenda-se exportar do Onshape para STEP e, em seguida, seguir as instruções na próxima seção para converter para glTF.

1. Após abrir o arquivo no Onshape, clique com o botão direito na montagem principal e escolha "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selecionando a opção &quot;Export...&quot;" />

2. Na janela pop-up de opções, garanta que o formato de exportação seja "STEP" e clique em "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Janela emergente de opções de exportação" />

3. Aguarde o arquivo converter e baixar. Isso pode levar alguns minutos.

## Convertendo STEP para glTF {#converting-step-to-gltf}

1. Baixe o [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Este aplicativo gratuito é capaz de converter entre muitos formatos 3D, incluindo STEP e glTF.

2. Abra o CAD Assistant e selecione o arquivo STEP a ser convertido:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Abrindo arquivo STEP no CAD Assistant" />

3. Aguarde o arquivo STEP ser importado. Isso pode levar alguns minutos.

4. Clique no ícone "Save":

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clicando no ícone &quot;Salvar&quot;" />

5. Escolha um local de salvamento e use o menu suspenso para alterar o formato de exportação para "glb":

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Alternando o formato de exportação" />

6. Clique no ícone de engrenagem, depois habilite "Merge faces within the same part":

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Habilitando &quot;Merge faces within the same part&quot;" />

7. Clique no ícone "Save" e aguarde a exportação terminar:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clicando no ícone &quot;Salvar&quot;" />
