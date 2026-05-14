import { useEffect, useRef } from 'react';
import { asset, enemyImage, zoneBackground } from '../lib/assets';
import type { Character, EnemyType } from '../lib/types';

export function PixiBattleStage({ character, enemy, flashKey }: { character: Character; enemy?: EnemyType; flashKey: number }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let destroyed = false;
    let app: any;

    async function boot() {
      const PIXI = await import('pixi.js');
      if (!hostRef.current || destroyed) return;

      app = new PIXI.Application();
      await app.init({ resizeTo: hostRef.current, backgroundAlpha: 0, antialias: true });
      hostRef.current.appendChild(app.canvas);

      const stage = app.stage;
      const bg = PIXI.Sprite.from(zoneBackground(character.currentZoneId));
      bg.anchor.set(0.5);
      bg.alpha = 0.58;
      stage.addChild(bg);

      const hero = PIXI.Sprite.from(asset.heroes[character.class]);
      hero.anchor.set(0.5, 1);
      stage.addChild(hero);

      const target = PIXI.Sprite.from(enemyImage(enemy?.id, enemy?.isBoss));
      target.anchor.set(0.5, 1);
      stage.addChild(target);

      const glow = PIXI.Sprite.from(asset.fx.reward);
      glow.anchor.set(0.5);
      glow.alpha = 0.22;
      stage.addChild(glow);

      const resize = () => {
        const w = app.renderer.width;
        const h = app.renderer.height;
        bg.x = w / 2;
        bg.y = h / 2;
        bg.width = w * 1.15;
        bg.height = h * 1.15;
        hero.x = w * 0.28;
        hero.y = h * 0.86;
        hero.height = Math.min(h * 0.72, 520);
        hero.scale.x = hero.scale.y;
        target.x = w * 0.72;
        target.y = h * 0.78;
        target.height = enemy?.isBoss ? Math.min(h * 0.72, 480) : Math.min(h * 0.54, 360);
        target.scale.x = target.scale.y;
        glow.x = target.x;
        glow.y = target.y - target.height * 0.45;
        glow.width = target.width * 1.8;
        glow.height = glow.width;
      };

      resize();
      let t = 0;
      app.ticker.add(() => {
        t += 0.03;
        hero.y += Math.sin(t) * 0.16;
        target.y += Math.cos(t * 0.9) * 0.16;
        glow.rotation += 0.003;
        glow.alpha = 0.18 + Math.sin(t * 2) * 0.06;
      });
    }

    boot();

    return () => {
      destroyed = true;
      if (app) app.destroy(true, { children: true, texture: false });
    };
  }, [character.class, character.currentZoneId, enemy?.id, enemy?.isBoss]);

  return (
    <div className="pixi-stage-wrap">
      <div ref={hostRef} className="pixi-stage" />
      <div key={flashKey} className="hit-flash"><img src={asset.fx.hit} alt="" /></div>
    </div>
  );
}
