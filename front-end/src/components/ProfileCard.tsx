import React from 'react';

interface ProfileCardProps {
	email?: string;  // Propiedad opcional que representa el correo electrónico del usuario.
}

const ProfileCard: React.FC<ProfileCardProps> = ({ email }) => {
	return (
		<div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '8px' }}>
			{/* Tarjeta resumida pequeña que se muestra en la columna lateral del dashboard. */}
			<h3>Perfil</h3>
			<p>{email || 'Sin correo'}</p>
		</div>
	);
};

export default ProfileCard;
