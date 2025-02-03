import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// Custom global configuration
Swal.defaultSettings = {
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
};

export { Toast };
export default Swal;