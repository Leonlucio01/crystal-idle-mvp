import { asset } from '../lib/assets';

export function ShopScreen() {
  return (
    <section className="screen shop-screen glass-panel">
      <img src={asset.icons.shop} alt="" />
      <h1>Tienda</h1>
      <p>Espacio reservado para cofres, cosméticos, pase idle y paquetes de diamantes.</p>
      <div className="coming-soon">Próxima fase</div>
    </section>
  );
}
