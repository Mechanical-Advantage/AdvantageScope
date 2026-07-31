---
sidebar_position: 1
---

# 📦 Instalação

A versão oficialmente suportada do AdvantageScope está disponível diretamente através da Equipe 6328 ou pelo instalador da WPILib. Várias distribuições não oficiais também estão disponíveis.

## Equipe 6328 {#team-6328}

### Downloads: [Estável](https://github.com/Mechanical-Advantage/AdvantageScope/releases/latest), [Pré-lançamento](https://github.com/Mechanical-Advantage/AdvantageScope/releases) {#6328-downloads}

Baixar o AdvantageScope diretamente da Equipe 6328 oferece:

- Os recursos e correções de erros mais recentes antes que estejam disponíveis por outros canais.
- Alertas no aplicativo quando uma nova versão estiver disponível para download.
- Uma coleção integrada de modelos de robôs recentes da 6328 para uso na guia 👀 [Campo 3D](/tab-reference/3d-field).

:::note
Antes de executar compilações do AppImage no Ubuntu 23.10 ou posterior, você deve baixar o perfil AppArmor da página de lançamentos e copiá-lo para /etc/apparmor.d.
:::

:::info
Cada versão principal do AdvantageScope é lançada em janeiro, antes do kickoff da FRC, com um número de versão correspondente ao ano (por exemplo, a v26.0.0 será lançada em janeiro de 2026). Versões beta e alpha do AdvantageScope podem estar disponíveis nos meses que antecedem cada lançamento, para equipes que desejam experimentar novos recursos e fornecer feedback. **As equipes que usam essas versões de pré-lançamento devem esperar encontrar problemas e erros não presentes nas versões estáveis.**
:::

## WPILib

### Instalação: [Documentação da WPILib](https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html) {#wpilib-installation}

O instalador da WPILib inclui um lançamento recente do AdvantageScope, mas pode estar desatualizado em relação à versão mais recente disponível para download direto. A documentação para iniciar o AdvantageScope a partir da versão do VSCode da WPILib pode ser encontrada [aqui](https://docs.wpilib.org/en/stable/docs/software/dashboards/advantagescope.html).

## Distribuições não oficiais

Distribuições não oficiais do AdvantageScope estão disponíveis de várias fontes, as quais não são oficialmente suportadas pelos desenvolvedores do AdvantageScope/WPILib. Essas distribuições podem ficar desatualizadas em relação à versão mais recente do AdvantageScope disponível de fontes oficiais. Entre em contato diretamente com os mantenedores em caso de problemas.

- [**AdvantageScope Lite para Sistema de Controle REV:**](https://github.com/j5155/AdvantageScope-Lite-FTC) Uma modificação do [AdvantageScope Lite](/more-features/advantagescope-lite) para uso no sistema de controle existente do FTC (anterior ao Systemcore).
- [**Instalador Homebrew:**](https://formulae.brew.sh/cask/advantagescope) Um cask do Homebrew para instalar o AdvantageScope a partir da linha de comando no macOS.
- [**Repositório do Usuário Arch:**](https://aur.archlinux.org/packages/advantagescope) Um método alternativo de distribuição para uso com o gerenciador de pacotes pacman (uma distribuição oficial do Arch do AdvantageScope está disponível [aqui](#6328-downloads)).
