import React from 'react';

interface ProfileCardProps {
	email?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ email }) => {
	return (
		<div style={{ border: '1px solid #ccc', padding: '12px', borderRadius: '8px' }}>
			<h3>Perfil</h3>
			<p>{email || 'Sin correo'}</p>
		</div>
	);
};

export default ProfileCard;
