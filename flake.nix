{
  description = "AdvantageScope Development Environment";

  inputs = {
    # Pin to a commit that has Emscripten 4.0.12
    nixpkgs.url = "github:NixOS/nixpkgs/f5b4ad5108eb56aab57e678c7e441ee750fdcb68";
  };

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.${system}.default =
        (pkgs.buildFHSEnv {
          name = "advantagescope-dev";
          targetPkgs =
            pkgs:
            (with pkgs; [
              nodejs_22
              emscripten # locked to 4.0.12
              python3
              pkg-config
              git
              gcc
              gnumake

              flatpak-builder
              flatpak
              elfutils

              udev
              alsa-lib
              vulkan-loader
              libGL
              egl-wayland
              nss
              nspr
              atk
              at-spi2-atk
              cups
              libdrm
              dbus
              mesa
              gtk3
              pango
              cairo
              glib
              libgbm
              expat
              libxkbcommon
              libxcb
              icu
              libz
              openssl
              nss
              nspr

              xorg.libX11
              xorg.libXcomposite
              xorg.libXdamage
              xorg.libXext
              xorg.libXfixes
              xorg.libXi
              xorg.libXrender
              xorg.libXtst
              xorg.libXrandr
              xorg.libXcursor
              xorg.libxcb
            ]);

          # runScript = "zsh";

          profile = ''
            export ASCOPE_DISTRIBUTION=FRC6328 
            export NIXOS_OZONE_WL=1 
          '';
        }).env;
    };
}
