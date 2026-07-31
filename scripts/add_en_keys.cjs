const fs = require('fs');
const path = require('path');

const enFile = path.join(__dirname, '..', 'src/i18n/locales/en.ts');
let content = fs.readFileSync(enFile, 'utf8');

const toAdd = `
  // Admin Users Modal
  'admin.modal.edit.title': 'Edit User',
  'admin.modal.field.name': 'Name',
  'admin.modal.field.email': 'Email',
  'admin.modal.field.role': 'Role',
  'admin.modal.field.trainer': 'Assigned Trainer',
  'admin.modal.trainer.none': 'No trainer',
  'admin.modal.blocked': 'Blocked user',
  'admin.modal.blocked.info': 'Cannot access the system',
  'admin.modal.block.btn': 'Block',
  'admin.modal.unblock.btn': 'Unblock',
  'admin.modal.save': 'Save Changes',
  'admin.modal.cancel': 'Cancel',
  'admin.modal.medical': 'Medical Profile',
  'admin.modal.delete': 'Delete',
  'admin.modal.reset.pwd': 'Reset Password',
`;

// Insert before closing }; 
content = content.replace(/\n};\n$/, toAdd + '\n};\n');
fs.writeFileSync(enFile, content, 'utf8');
console.log('EN locale updated successfully. Lines:', content.split('\n').length);
