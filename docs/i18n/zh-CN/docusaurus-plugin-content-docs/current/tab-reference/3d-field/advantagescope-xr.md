# AdvantageScope XR {#advantagescope-xr}

AdvantageScope XR 将 👀 [3D 场地](/tab-reference/3d-field) 视图在增强现实 (AR) 中生动呈现，让你能够以全新的方式可视化数据。看生命等大的模拟自动阶段、用桌面场地模型复盘比赛策略、在真实机器人上叠加诊断信息等等！下面的视频展示了此功能的多个使用场景：

<iframe width="100%" style={{"aspect-ratio": "16 / 9"}} src="https://www.youtube.com/embed/gWPhQyB66DQ" title="AdvantageScope XR: Feature Overview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 要求 {#requirements}

- **主机：** 运行在 Windows、macOS 或 Linux（v4.1.0 或更高版本）上的 AdvantageScope 桌面应用程序。设备上的任何防火墙都应处于 [禁用状态](https://docs.wpilib.org/zh-cn/stable/docs/networking/networking-introduction/windows-firewall-configuration.html#disabling-windows-firewall)。
- **客户端：** 运行 iOS/iPadOS 16 或更高版本的 iPhone 或 iPad。无需安装应用程序。
- **网络：** 两台设备必须连接到同一个网络（Wi-Fi、USB 共享网络等）。受下文要求约束，该网络无需连接到互联网。
- **互联网：** 如果近期未使用过 AdvantageScope XR，移动设备必须具备互联网连接（例如蜂窝数据）。要取消此要求，请查看下文的 [离线使用](#offline-usage) 部分。

:::tip
AdvantageScope XR 在许多 iPhone 和 iPad 机型上均获得支持，但在具备 **LiDAR 传感器** 的设备上更稳定。这包括 iPhone Pro（自 iPhone 12 Pro 开始）和 iPad Pro（2020 年春季或更高版本）。
:::

<details>
<summary>其他平台怎么样？</summary>

AdvantageScope XR 仅在 iOS 和 iPadOS 上受到支持。目前没有支持其他平台的计划。客户端应用程序需要与原生 API 进行紧密集成，以实现增强现实、视频录制、Web 渲染等。iOS 和 iPadOS 获得开发和支持的优先权有以下几个原因：

- **一致性：** AdvantageScope XR 是一项高要求应用程序。虽然 Android 设备在处理能力和功能上差异巨大，但 iPhone 和 iPad 跨代提供了统一的开发体验。所有近期的 iOS 和 iPadOS 设备都足够强大，可以运行 AdvantageScope XR，而较新的设备则支持 AdvantageScope 可以利用的附加功能（如 LiDAR）。

- **可用性：** iPhone 依然是美国的学生最可能拥有或能轻松从同伴处借到的最常见智能手机，比任何型号的 VR 或混合现实头显都更加广泛可用。支持 iOS 可以最大化能够轻松使用 AdvantageScope XR 的用户数量。

- **平板电脑支持：** 用户可以利用在平板电脑上运行 AdvantageScope XR 的优势，因为平板电脑提供了更大的显示屏，更便于多人同时查看。iPad 是全球最常用的平板电脑，因此支持 iPadOS 可以使平板电脑体验尽可能易于获取。

</details>

## 设置 {#setup}

1. 在主机系统上，在任何 3D 场地选项卡上 **点击 "XR" 按钮**。同一时间只能激活一个 XR 主机会话，因此点击此按钮将打断任何其他活动会话。

<img src="/img/tab-reference/3d-field/xr-1.webp" alt="XR 按钮" />

2. 将打开 **XR 控制窗口**，其中包含二维码和自定义 AR 体验的 [选项](#options)。要取消 XR 会话并断开所有客户端，请关闭控制窗口。

<img src="/img/tab-reference/3d-field/xr-2.webp" alt="XR 窗口" />

3. 使用客户端设备上的 **内置相机应用** 扫描二维码。无需安装应用程序。
4. 轻点“AdvantageScope XR”然后轻点“打开”以 **启动体验** 并连接到主机。如果弹出提示，请允许 AdvantageScope XR 访问 **相机和本地网络**。
5. 按照设备上的说明进行 **校准并放置场地模型**。
6. 使用主机设备像往常一样控制场地模型，包括 **日志重放和实时串流**。场地模型的状态将在客户端设备上实时显示。
7. 要快速 **录制视频**，请轻点屏幕顶部的“录制”图标。再次轻点它停止录制，然后编辑并保存剪辑。

:::warning
热力图和 Swerve 模块速度在 XR 中尚不可用。所有其他对象类型均受到支持。
:::

:::tip
AdvantageScope XR 是一项高要求应用程序，根据 3D 场景的复杂程度，可能会遇到性能问题。必要时可考虑使用更简单的机器人模型或更少的对象。
:::

## 选项 {#options}

XR 控制窗口提供了几个控制模型在增强现实中如何显示的选项：

- **校准：**
  - 选择 _微缩模型_ 以可视化按比例缩小的场地版本，适合桌面使用。
  - 选择 _全尺寸_ 以准确缩放比例可视化场地，并基于真实场地围栏进行定位。在 _蓝方联盟_ 和 _红方联盟_ 之间切换可控制使用场地的哪一侧进行校准，但在所有情况下都会可视化整个场地。
- **串流：**
  - 选择 _平滑_，适用于能够接受一定延迟以换取更可靠串流的应用场景，例如模拟自动阶段例程或重放日志文件。
  - 选择 _低延迟_，适用于能够接受一定抖动但要求实时的应用场景，例如在真实机器人上叠加数据或在遥控阶段驾驶模拟机器人。
- **显示地板：** 在场地下方显示平整的地毯/瓷砖模型，而不是叠加在真实地面上。
- **显示场地：** 显示场地模型，包括场地围栏和特定比赛元素。自定义 [游戏元素对象](/tab-reference/3d-field#game-piece-objects) 始终显示。
- **显示机器人：** 显示机器人模型，在将数据叠加到真实机器人上时（例如视觉目标或 2D 机构）可以将其禁用。

## 离线使用 {#offline-usage}

AdvantageScope XR 不需要互联网连接。为确保应用可以离线使用，请使用下方链接从 App Store 下载 AdvantageScope XR。要连接到 AdvantageScope 桌面应用程序，请使用 iOS 相机应用扫描二维码，或在 AdvantageScope XR 应用中轻点“扫描”按钮。

<img src="/img/tab-reference/3d-field/app-store.svg" alt="App Store" />

:::note
即使在没有互联网连接的情况下运行，主机和客户端设备 **也必须连接到同一个网络**（例如机器人、自定义 Wi-Fi 网络或通过 USB 网络共享）。
:::
