/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * The KubePreflight release every version-pinned command on the site is
   * pinned to. See .env.example.
   */
  readonly PUBLIC_KUBEPREFLIGHT_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
