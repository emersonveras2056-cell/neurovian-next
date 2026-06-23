/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Áudios e uploads enviados pelo admin não devem passar por otimização de imagem nem cache agressivo.
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb' // permite upload de arquivos de áudio pelo painel admin
    }
  }
};

module.exports = nextConfig;
