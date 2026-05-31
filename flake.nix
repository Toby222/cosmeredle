{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    bun2nix.url = "github:nix-community/bun2nix";
    bun2nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  nixConfig = {
    extra-substituters = [
      "https://nix-community.cachix.org"
    ];
    extra-trusted-public-keys = [
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
    ];
  };

  outputs =
    {
      self,
      nixpkgs,
      bun2nix,
    }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import nixpkgs {
              inherit system;
              overlays = [ bun2nix.overlays.default ];
            };
          }
        );
    in
    {
      formatter = forEachSupportedSystem (
        { pkgs, ... }: pkgs.writeShellScriptBin "format" "${pkgs.bun}/bin/bun run fix"
      );
      devShells = forEachSupportedSystem (
        { pkgs, ... }:
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              nixd
              biome
              bun
              nixfmt
              bun2nix.packages.${pkgs.stdenv.hostPlatform.system}.default
            ];
            env = {
              LOG_TO_FILE = "true";
              LOG_LEVEL = "trace";
              POSTGRES_URL = "/var/run/postgresql";
            };
          };
        }
      );
      nixosModule = self.nixosModules.cosmeredle;
      nixosModules.cosmeredle =
        { config, pkgs, ... }:
        let
          cfg = config.services.cosmeredle;
        in
        {
          options.services.cosmeredle = {
            enable = pkgs.lib.mkEnableOption "cosmeredle service";
            seed = pkgs.lib.mkOption {
              default = "RANDOM_SEED";
              example = "RAnDom_s_t_rING_%91%";
              description = "An arbitrary value to make sure the daily character is unpredictable";
              type = pkgs.lib.types.str;
            };
            package = pkgs.lib.mkPackageOption pkgs "cosmeredle" {
              default = [ "cosmeredle" ];
              example = "pkgs.cosmeredle";
            };
          };

          config = {
            nixpkgs.overlays = [ self.overlays.default ];
            systemd.services.cosmeredle = pkgs.lib.mkIf cfg.enable {
              enable = cfg.enable;
              wantedBy = [ "multi-user.target" ];
              wants = [ "network-online.target" ];
              description = "Cosmeredle";
              path = [ ];
              environment = {
                RANDOM_SEED = cfg.seed;
              };

              serviceConfig = {
                Type = "simple";
                Restart = "on-failure";
                RestartSec = "5s";
                WorkingDirectory = "${cfg.package}/bin/";
                ExecStart = "${cfg.package}/bin/cosmeredle";
              };
            };
          };
        };
      overlays.default = final: prev: {
        cosmeredle = self.packages.${final.stdenv.hostPlatform.system}.default;
      };
      packages = forEachSupportedSystem (
        { pkgs, ... }:
        {
          default = pkgs.bun2nix.mkDerivation {
            packageJson = ./package.json;

            src = pkgs.lib.cleanSource ./.;

            bunDeps = pkgs.bun2nix.fetchBunDeps {
              bunNix = ./cosmeredle.bun.nix;
            };

            # Get the flags from package.json for parity
            bunBuildFlags =
              builtins.replaceStrings [ "bun build " ] [ "" ]
                (builtins.fromJSON (builtins.readFile ./package.json)).scripts.build;

            # All the executable scripts are just for dev utility, not relevant to the package
            dontUseBunPatch = true;
            # We don't need husky in the build env
            dontRunLifecycleScripts = true;
          };
        }
      );
    };
}
