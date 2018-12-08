var nowDate = new Date();
var today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0, 0);
$('#datepicker').datetimepicker({
    uiLibrary: 'bootstrap4',
    format: 'yyyy-mm-dd HH:MM',
    footer: true,
    modal: true,
    datepicker: {
        minDate: today
    }
});