# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR 将 👀 [3D 场地](/tab-reference/3d-field)视图带入增强现实 (AR)，为你提供全新的数据可视化方式。你可以按真实比例查看自动阶段仿真效果、借助桌面微缩场地模型复盘比赛策略，或在真实机器人上直接叠加诊断信息等。以下视频展示了该功能的多种应用场景：

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 要求 {#requirements}

- **主机：** 运行在 Windows、macOS 或 Linux 上的 AdvantageScope 桌面应用程序（v4.1.0 或更高版本）。请确保[关闭](https://docs.wpilib.org/zh-cn/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall)设备上的防火墙。
- **客户端：** 运行 iOS/iPadOS 16 或更高版本的 iPhone 或 iPad，无需安装额外应用。
- **网络：** 两台设备必须连接至同一网络（如 Wi-Fi、USB 网络共享等）。除下述情况外，该网络无需连接互联网。
- **互联网：** 如果近期未曾使用过 AdvantageScope XR，移动设备需要联网（例如通过蜂窝数据）。如需免除联网要求，请参阅下方的[离线使用](#offline-usage)部分。

:::tip
AdvantageScope XR 支持众多 iPhone 和 iPad 机型，但在配备 **LiDAR 传感器**的设备上运行更加稳定，包括 iPhone Pro（iPhone 12 Pro 及以上机型）和 iPad Pro（2020 年春季及以后发布的机型）。
:::

<details>
<summary>其他平台怎么样？</summary>

AdvantageScope XR 目前仅支持 iOS 和 iPadOS，暂无适配其他平台的计划。客户端需要深度调用原生 API 来实现增强现实、视频录制和网页渲染等功能。优先开发并支持 iOS 和 iPadOS 主要基于以下几点考量：

- **一致性：** AdvantageScope XR 对设备性能要求较高。Android 设备在算力和功能上参差不齐，而 iPhone 和 iPad 跨代际均能提供一致的开发体验。近期所有 iOS 和 iPadOS 设备都具备足够的性能来运行 AdvantageScope XR，较新的机型还支持 LiDAR 等额外特性，可进一步提升效果。

- **普及度：** 在美国学生群体中，iPhone 依然是最常见、最容易从身边同学借用的智能手机，其普及程度远高于各类 VR 或混合现实头显。支持 iOS 能让尽可能多的用户轻松体验 AdvantageScope XR。

- **平板电脑支持：** 用户也可以在平板电脑上运行 AdvantageScope XR，借助更大的屏幕方便多人同时观看。iPad 是全球使用最广泛的平板电脑，因此支持 iPadOS 能让大屏体验触手可及。

</details>

## 设置 {#setup}

1. 在主机端任意 3D 场地选项卡中**点击“XR”按钮**。同一时间只能运行一个 XR 主机会话，点击该按钮会中断当前正在进行的其他会话。

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="XR 按钮" height="450" />

_上图所示为英文界面。_

2. 随后会打开 **XR 控制窗口**，其中包含二维码以及用于自定义 AR 体验的[选项](#options)。如需取消 XR 会话并断开所有客户端连接，关闭该控制窗口即可。

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="XR 窗口" height="350" />

_上图所示为英文界面。_

3. 使用客户端设备的**内置相机应用**扫描二维码，无需安装应用程序。
4. 轻点“AdvantageScope XR”，再轻点“打开”以**启动体验**并连接到主机。如弹出权限提示，请允许 AdvantageScope XR 访问**相机和本地网络**。
5. 按照设备屏幕上的提示**校准并放置场地模型**。
6. 像往常一样在主机端操作场地模型，包括**日志回放和实时串流**，场地状态会实时同步显示在客户端设备上。
7. 如需快速**录制视频**，请轻点屏幕顶部的“录制”图标；再次轻点即可停止录制，随后可对视频片段进行编辑和保存。

:::warning
热力图和 Swerve 模块速度暂不支持在 XR 中显示，其余对象类型均可正常使用。
:::

:::tip
AdvantageScope XR 对硬件性能要求较高，3D 场景过于复杂时可能会出现卡顿。如有需要，建议换用更精简的机器人模型或减少显示的对象数量。
:::

## 选项 {#options}

XR 控制窗口提供以下选项，用于控制模型在增强现实中的显示效果：

- **校准：**
  - 选择 _微缩模型_ 可查看按比例缩小的场地，适合放在桌面上使用。
  - 选择 _原尺寸_ 可按真实比例显示场地，并依托真实场地围挡进行定位。切换 _蓝方联盟_ 或 _红方联盟_ 仅决定校准时以场地的哪一侧为基准，两种设置下都会完整显示整个场地。
- **串流：**
  - 选择 _平滑_ 适合对延迟不敏感、更看重画面流畅稳定的场景，如自动阶段例程仿真或日志文件回放。
  - 选择 _低延迟_ 适合要求实时响应、可接受轻微画面抖动的场景，如在真实机器人上叠加数据或在遥控阶段驾驶仿真机器人。
- **显示地板：** 在场地下方渲染平整的地毯/地垫模型，而不直接叠加在现实地面上。
- **显示场地：** 显示场地模型（包括场地围挡和赛季专属元素）。自定义的[游戏元素对象](/tab-reference/3d-field#game-piece-objects)始终保持显示。
- **显示机器人：** 显示机器人模型；在真实机器人上叠加视觉目标或 2D 机构等数据时，可以关闭此项。

## 离线使用 {#offline-usage}

AdvantageScope XR 无需连接互联网即可使用。为确保离线可用，请通过下方链接从 App Store 下载 AdvantageScope XR 应用。连接 AdvantageScope 桌面端时，使用 iOS 相机应用扫描二维码，或在 AdvantageScope XR 应用中轻点“扫描”按钮即可。

[<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />](https://apps.apple.com/us/app/advantagescope-xr/id6739718081)

:::note
即使在离线环境下运行，主机和客户端设备仍**必须连接到同一网络**（例如机器人网络、自定义 Wi-Fi 网络或通过 USB 网络共享连接）。
:::
