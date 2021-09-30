// Pour pouvoir y accéder facilement via des noms dynamiques
const Element = {
    shooter: document.querySelector('.shooter'),
    monster: document.querySelector('.monster'),
    bullets: [],
    destination: document.querySelector('.destination'),
};

const speedMonster = 2;
const speedBullet = 5;
const attackSpeedTurret = 0.5;
const bulletFollowMonster = true;
const bulletDamages = 1;
let monsterLife = 3;
let animFrameId;

const Rect = {
    shooter: null,
    monster: null,
    monster_init: null,
    bullets: null,
    destination: null,
};

// Met à jour la position
const setPosition = (element, x, y) => {
    element.style.setProperty('left', x + 'px');
    element.style.setProperty('top', y + 'px');
};

const isCollide = (rect1, rect2) => {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
    );
};

const clean = (cleanMonster, cleanBullet) => {
    if (cleanMonster) {
        Element.monster.remove();
        Element.monster = null;
    }

    if (cleanBullet) {
        Element.bullet.remove();
        bullet = null;
    }
};

const move = (elementToMove, rectToMove, rectDest, speed) => {
    const xTotal = rectDest.x - rectToMove.x;
    const yTotal = rectDest.y - rectToMove.y;

    // Théorème de Pythagore
    // On connait les cotés de l'angle droit et on veut connaitre l'hypoténuse
    const distanceTotal = Math.sqrt(xTotal * xTotal + yTotal * yTotal);
    const distanceDone = Math.min(distanceTotal, speed);

    // Theorème de Thalès
    // On connait la distance parcourue et la distance total
    // On connait xTotal, via un produit en croix, on connaitra x
    // On connait yTotal, via un produit en croix, on connaitra y
    const x = (distanceDone * xTotal) / distanceTotal;
    const y = (distanceDone * yTotal) / distanceTotal;

    setPosition(elementToMove, rectToMove.x + x, rectToMove.y + y);
};

const moveAll = () => {
    animFrameId = requestAnimationFrame(moveAll);

    if (Element.monster) {
        // Déplace le monstre
        move(Element.monster, Rect.monster, Rect.destination, speedMonster);
        // Met à jour la position du monstre
        updateRect('monster');
    }

    if (Element.bullets.length) {
        // Déplace la balle en fonction de la nouvelle position du monstre
        Element.bullets.forEach((bullet, i) =>
            move(
                bullet,
                getBoundingClientRect(bullet),
                bulletFollowMonster ? Rect.monster : Rect.monster_init,
                speedBullet,
            ),
        );
        // updateRectBullets();
    }

    // Vérifie si collision sinon on continue le déplacement
    if (Element.monster && isCollide(Rect.monster, Rect.destination)) {
        console.log('Life - 1');
        clean(true, false);
    } else if (Element.bullets.length) {
        Element.bullets.forEach((bullet) => {
            if (isCollide(getBoundingClientRect(bullet), Rect.monster)) {
                monsterLife -= bulletDamages;
                if (monsterLife <= 0) {
                    console.log('Monster destroyed');
                    clean(true, false);
                    cancelAnimationFrame(animFrameId);
                }
                bullet.remove();
            }
            if (isCollide(getBoundingClientRect(bullet), Rect.monster_init)) {
                console.log('Bullet out of range');
                bullet.remove();
            }
            if (!Element.monster) bullet.remove();
        });
    }
};

const getBoundingClientRect = (element) => {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY,
        width: rect.width,
        height: rect.height,
    };
};

const getRects = () => {
    return {
        monster: getBoundingClientRect(Element.monster),
        bullets: [...Element.bullets].map((bullet) => getBoundingClientRect(bullet)),
        destination: getBoundingClientRect(Element.destination),
        shooter: getBoundingClientRect(Element.shooter),
    };
};

const updateRect = (elementId) => {
    Object.assign(Rect, {
        [elementId]: getBoundingClientRect(Element[elementId]),
    });
};

const updateRectBullets = () => {
    Object.assign(Rect, {
        bullets: Element.bullets.map((bullet) => getBoundingClientRect(bullet)),
    });
};

const createBullet = () => {
    const div = document.createElement('div');
    div.classList.add('circle', 'bullet');
    div.dataset.name = 'Bullet';
    Element.bullets.push(div);
    updateRectBullets();
    return div;
};

const fireTurret = () => {
    if (Element.monster) {
        const bullet = createBullet();

        container.appendChild(bullet);
        setPosition(bullet, Rect.shooter.x, Rect.shooter.y);
        // console.log(Element);

        setTimeout(fireTurret, 1000 / attackSpeedTurret);
    }
};

(function init() {
    // Initialise les positions

    setPosition(Element.monster, 100, 100);
    setPosition(Element.destination, 1000, 100);
    setPosition(Element.shooter, 300, 500);

    // Ajoute les positions des éléments et la position initiale du monstre
    Object.assign(Rect, getRects());
    Object.assign(Rect, { monster_init: Rect.monster });

    moveAll();

    fireTurret();
})();
