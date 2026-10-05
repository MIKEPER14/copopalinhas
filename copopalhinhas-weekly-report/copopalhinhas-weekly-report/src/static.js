// Conteúdo fixo do deck (slides de plano e Klaviyo). Edita aqui quando o plano mudar.
module.exports = {
  roadmap: [
    { w: "Semanas 1–2", h: "Estancar", t: ["Feed Google Shopping / Merchant Center", "Corrigir begin_checkout e purchase «Unassigned»", "UTMs + Pixel/CAPI no Meta", "Escalar «Copos - Pesquisa»"] },
    { w: "Semanas 2–4", h: "Preparar", t: ["Validar dados GA4 vs WooCommerce", "Consentimento (RGPD) para email/SMS", "Setup Klaviyo + integração WooCommerce", "Segmentar reporting: marca / comercial / genérico"] },
    { w: "Mês 2", h: "Automatizar", t: ["Fluxo de carrinho abandonado (3 toques)", "Welcome series + pós-compra", "Rever SERP «copo» e página servida", "Titles/metas das 30 páginas com CTR <1%"] },
    { w: "Mês 3", h: "Escalar", t: ["Jornada B2B / eventos e reativação", "Browse abandonment e cross-sell", "Programa de avaliações (aggregateRating)", "Revisão de resultados e ROI do Klaviyo"] },
  ],
  klaviyo_porque: [
    "Integração nativa com WooCommerce: sincroniza clientes, encomendas, carrinhos e catálogo sem desenvolvimento à medida.",
    "Fluxos pré-construídos (carrinho abandonado, welcome, pós-compra, winback) editáveis em pt-PT.",
    "Segmentação por comportamento e valor: B2C vs B2B/eventos, ticket médio, categoria comprada, recência.",
    "Email + SMS + push no mesmo perfil de cliente; consentimento RGPD gerido na plataforma.",
    "Atribuição própria por fluxo — permite medir receita incremental sem depender do tracking GA4 que ainda está a ser corrigido.",
    "Escala para Espanha: listas e fluxos por idioma/mercado quando o lançamento ES avançar.",
  ],
  carrinho: [
    { t: "Gatilho", d: "Cliente adiciona ao carrinho ou inicia checkout com email conhecido. Filtro: não comprou desde então.", when: "T0" },
    { t: "Email 1 — Lembrete", d: "«Deixou algo no carrinho». Produtos do carrinho com imagem, preço e CTA direto para o checkout. Sem desconto.", when: "+1 h" },
    { t: "Email 2 — Confiança", d: "Portes, prazos, opções de personalização e prova social (avaliações). Resposta às objeções típicas B2B: fatura, quantidades, entrega.", when: "+24 h" },
    { t: "SMS / Email 3 — Incentivo", d: "Só para carrinhos > 150 € ou clientes novos: portes grátis ou 5%. Termina o fluxo se comprou entretanto.", when: "+48 h" },
    { t: "Saída", d: "Placed Order encerra o fluxo em qualquer ponto. Perfis sem compra vão para segmento «Interessado – não converteu» (30 dias).", when: "+72 h" },
  ],
  jornada: [
    { h: "Descoberta", f: "Welcome series", d: "3 emails após subscrição/pop-up: quem somos e sustentabilidade, categorias mais vendidas, personalização para eventos. Objetivo: 1.ª compra em 14 dias.", kpi: "Taxa de conversão de subscritor" },
    { h: "Consideração", f: "Browse abandonment", d: "Viu um produto 2+ vezes sem adicionar ao carrinho: email com o produto, alternativas e FAQ. Só para perfis identificados.", kpi: "CTR e conversão do fluxo" },
    { h: "Compra", f: "Carrinho abandonado", d: "Fluxo de 3 toques (slide anterior). Variante B2B com foco em quantidades, orçamento e fatura.", kpi: "Taxa de recuperação" },
    { h: "Pós-compra", f: "Pós-compra + avaliação", d: "Confirmação enriquecida, dicas de utilização/lavagem, pedido de avaliação ao dia 10 (alimenta aggregateRating) e cross-sell de acessórios.", kpi: "Avaliações recolhidas · 2.ª compra" },
    { h: "Retenção", f: "Reposição e winback", d: "Reposição ao fim de 60–90 dias para consumíveis; winback aos 120 dias sem compra com oferta ligeira; VIP para top 10% de valor.", kpi: "Taxa de recompra · LTV" },
    { h: "B2B / Eventos", f: "Jornada comercial", d: "Segmento por ticket > 300 € ou categoria eventos: catálogo personalizado, contacto comercial, lembrete sazonal (festas, verão, Natal).", kpi: "Receita B2B por perfil" },
  ],
  implementacao: [
    ["1", "Setup e integração", "Conta Klaviyo; ligar WooCommerce (sincronização de clientes, encomendas, catálogo); instalar snippet e verificar eventos Viewed Product, Added to Cart, Started Checkout, Placed Order", "Eventos a chegar em tempo real"],
    ["1–2", "Consentimento e listas", "Formulários de subscrição (pop-up + checkout + rodapé) com dupla confirmação; política RGPD; importar base atual do WooCommerce com estado de consentimento", "Lista principal ativa e conforme"],
    ["2–3", "Carrinho abandonado", "Construir e testar os 3 toques em pt-PT; regras de incentivo; variante B2B; validar links de checkout com carrinho pré-carregado", "Fluxo em produção"],
    ["3–4", "Welcome + pós-compra", "Séries de boas-vindas e pós-compra; pedido de avaliação (WooCommerce reviews) e cross-sell por categoria", "2 fluxos em produção"],
    ["4–5", "Segmentação e B2B", "Segmentos por valor, categoria, recência; jornada B2B/eventos; winback e reposição", "Segmentos e 3 fluxos ativos"],
    ["6", "Medição e reporting", "Ligar Klaviyo ao Windsor.ai; dashboard de receita atribuída por fluxo; primeira revisão com resultados", "Report mensal integrado"],
  ],
  tracking_fixo: [
    { h: "Duplicação de purchase (em aberto)", t: "GTM4WP e Site Kit podem estar ambos a enviar purchase para GA4/Ads. Os totais absolutos de encomendas devem ser validados contra o WooCommerce.", c: "amber" },
    { h: "Meta → site sem UTM", t: "Cliques no link do Meta não aparecem como Paid Social em GA4. Adicionar UTMs a todos os anúncios e confirmar o destino.", c: "amber" },
  ],
};
