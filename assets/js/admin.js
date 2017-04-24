$(document).ready(function(){
	$("body").on('click',".delete-confirm",function(e){
		e.preventDefault();
		var url = $(this).attr('href');
		fancyConfirm('Esti sigur ca vrei sa stergi inregistrarea?',function(r){ 
			if(r) window.location.href = url;
		});
	});
	var prm_startDate = new Date();
	$('#prm_StartDate').datepicker({
		dateFormat:'yyyy-mm-dd',
		endDate: prm_startDate,
		autoclose:true,
		orientation:'auto top'
	}).on('changeDate', function(selected){
		prm_startDate = new Date(selected.date.valueOf());
		prm_startDate.setDate(prm_startDate.getDate(new Date(selected.date.valueOf())));
		$('#prm_EndDate').datepicker('setStartDate', prm_startDate);
	});
	$('#prm_EndDate').datepicker({
		dateFormat:'yyyy-mm-dd',
		startDate: new Date(),
		endDate: new Date(),
		autoclose: true,
		orientation:'auto top'
	}).on('changeDate', function(selected){
		endDate = new Date(selected.date.valueOf());
		endDate.setDate(endDate.getDate(new Date(selected.date.valueOf())));
		$('#prm_StartDate').datepicker('setEndDate', endDate);
	});
});