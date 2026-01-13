{ ... }:
{
  projectRootFile = "flake.nix";
  programs.nixfmt.enable = true;
  programs.actionlint.enable = true;
  programs.prettier.enable = true;
}
