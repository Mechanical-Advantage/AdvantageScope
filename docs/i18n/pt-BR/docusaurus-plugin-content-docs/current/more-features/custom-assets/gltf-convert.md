# Convertendo arquivos Onshape e STEP para glTF {#converting-onshape-and-step-files-to-gltf}

A visualização 3D do AdvantageScope aceita modelos personalizados de campos e robôs, que você pode instalar seguindo o passo a passo [desta página](/more-features/custom-assets). Todos os modelos precisam usar o formato binário de [glTF](https://www.khronos.org/gltf/) (`.glb`), escolhido pelos arquivos menores e pelo carregamento rápido.

:::info
Os arquivos glTF existem em dois formatos: JSON (`.gltf`) e binário (`.glb`). O AdvantageScope exige o formato binário **`.glb`**, que reúne todos os dados do modelo em um único arquivo.
:::

## Convertendo Onshape para STEP {#converting-onshape-to-step}

Embora o Onshape tenha uma opção para exportar direto em glTF, isso costuma gerar arquivos enormes e difíceis de gerenciar. O melhor caminho é exportar do Onshape como STEP e depois seguir as instruções da próxima seção para converter para glTF binário (`.glb`).

1. Com o arquivo aberto no Onshape, clique com o botão direito na montagem principal e escolha "Export...":

<img src="/img/more-features/custom-assets/gltf-convert-1.webp" alt="Selecionando a opção &quot;Export...&quot;" />

2. Na janela de opções que abrir, confira se o formato está definido como "STEP" e clique em "Export":

<img src="/img/more-features/custom-assets/gltf-convert-2.webp" alt="Janela de opções de exportação" />

3. Aguarde a conversão e o download do arquivo. Isso pode levar alguns minutos.

## Convertendo STEP para glTF (.glb) {#converting-step-to-gltf}

1. Baixe o [CAD Assistant](https://www.opencascade.com/products/cad-assistant/). Esse aplicativo gratuito converte entre vários formatos 3D, incluindo STEP e glTF (`.glb`).

2. Abra o CAD Assistant e selecione o arquivo STEP que você quer converter:

<img src="/img/more-features/custom-assets/gltf-convert-3.webp" alt="Abrindo arquivo STEP no CAD Assistant" />

3. Aguarde a importação do arquivo STEP. Isso pode levar alguns minutos.

4. Clique no ícone "Save":

<img src="/img/more-features/custom-assets/gltf-convert-4.webp" alt="Clicando no ícone &quot;Save&quot;" />

5. Escolha onde salvar e use o menu suspenso para mudar o formato de exportação para "glb" (glTF binário):

<img src="/img/more-features/custom-assets/gltf-convert-5.webp" alt="Alterando o formato de exportação" />

6. Clique no ícone de engrenagem e ative a opção "Merge faces within the same part":

<img src="/img/more-features/custom-assets/gltf-convert-6.webp" alt="Ativando &quot;Merge faces within the same part&quot;" />

7. Clique no ícone "Save" e espere a exportação terminar:

<img src="/img/more-features/custom-assets/gltf-convert-7.webp" alt="Clicando no ícone &quot;Save&quot;" />

Depois de exportar, renomeie o arquivo `.glb` (por exemplo, `model.glb`) e adicione-o à sua pasta de recursos personalizados conforme descrito na página [Recursos personalizados](/more-features/custom-assets).
