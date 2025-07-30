export const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  paddingTop: '50px',
  paddingBottom: '50px',
  overflow: 'auto',
  zIndex: 1000
};

export const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '5px',
  width: '80%',
  maxWidth: '500px',
  maxHeight: '80vh',
  overflow: 'auto',
  margin: 'auto'
};

export const modalActionsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px'
};
