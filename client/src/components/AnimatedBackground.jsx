import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        // Plusieurs lignes de cours boursier
        const lignes = [
            { points: [], couleur: '#00ff8833', vitesse: 1.2, offset: 0 },
            { points: [], couleur: '#00aaff22', vitesse: 0.8, offset: 200 },
            { points: [], couleur: '#ff444422', vitesse: 1.0, offset: 400 },
        ];

        // Générer les points de départ
        lignes.forEach((ligne) => {
            let y = canvas.height / 2 + ligne.offset - 300;
            for (let x = 0; x < canvas.width + 100; x += 8) {
                y += (Math.random() - 0.5) * 20;
                y = Math.max(50, Math.min(canvas.height - 50, y));
                ligne.points.push({ x, y });
            }
        });

        let animationId;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            lignes.forEach((ligne) => {
                // Décaler tous les points vers la gauche
                ligne.points.forEach((p) => { p.x -= ligne.vitesse; });

                // Ajouter un nouveau point à droite
                const dernier = ligne.points[ligne.points.length - 1];
                const nouvelleY = dernier.y + (Math.random() - 0.5) * 20;
                ligne.points.push({
                    x: dernier.x + 8,
                    y: Math.max(50, Math.min(canvas.height - 50, nouvelleY)),
                });

                // Supprimer les points hors écran
                if (ligne.points[0].x < -10) ligne.points.shift();

                // Dessiner la ligne
                ctx.beginPath();
                ctx.moveTo(ligne.points[0].x, ligne.points[0].y);
                ligne.points.forEach((p) => ctx.lineTo(p.x, p.y));
                ctx.strokeStyle = ligne.couleur;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });

            animationId = requestAnimationFrame(draw);
        }

        draw();

        const handleResize = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
}
