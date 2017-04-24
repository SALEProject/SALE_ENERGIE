/**
 * app.js
 *
 */

var orders = [];
var chat = [];
var transactions = [];
var all_transactions = [];
var alerts = [];
var live = true;
var time = null;
var time_interval = null;
var gntypes = [];
var chart = null;
var chart_ticks = [];
var last_chart_ticks = null;
var notifications = [];
var journal = [];
var users = [];
var journal_filters = {};
var last_notification = 0;

var chart_processing = false;

 $(document).on('socketConnected',function(e) {
	log('socketConnected !!');
	/************** chat ************/
	if($("#chat-container").length>0) {
		getChatMessages(true);
		
		var $input = $('#chat-input');

		$input.keypress(function (e) {
			if (e.keyCode === 13) {
				var chatToSend = $input.val();
				
				// TODO: lock the input, draw loading spinner
				socket.post('/chat/post', {
					message: chatToSend
				}, function(response) {
					// TODO: clear input hide loading spinner
					$(e.currentTarget).val('');
				});
			}
		});
	}
	
	/********** transactions *******************/
	if($("#transactions-container").length>0) {
		getTransactions(true);
	}
	/********** transactions *******************/
	if($("#all-transactions-container").length>0) {
		getAllTransactions(true);
	}
	
	/********** users *******************/
	if($("#users-container").length>0) {
		getUsers(true);
	}
	
	/********** journal *******************/
	if($("#journal-container").length>0) {
		getJournal(true);
		$('body').on('click',"#filter-journal",function(e) {
			e.preventDefault();
			journal_filters.user = $("#journal-ID_User").val();;
			journal_filters.agency = $("#journal-ID_Agency").val();;
			journal_filters.startdate = $("#journal-startDate").val();;
			if(table_api.length>0) {
				journal = [];
				table_api.fnClearTable();
				$("#example-table_wrapper").append('<div class="loader-overlayer"></div>');
				socket.get('/home/journal', journal_filters, function(response) {
					if(response.success) {
						if(response.data && response.data.length>0) {
							for (var i=0;i<response.data.length;i++) {
								appendJournal(response.data[i]);
							}
							if(table_api.length>0) {
								table_api.fnDraw();
								$("#example-table_wrapper .loader-overlayer").remove();
							}
						}
					}
					else {
						log('error loading filtered journal ('+response.error+')');
					}
				});
			}
		});
	}
	
	/********** notifications *******************/
	if($("#notification-list").length>0) {
		getNotifications(true);
		$('body').on('click',".notification-action",function(e) {
			e.preventDefault();
			var ID = $(this).attr('data-id');
			$li = $(this).closest('.notification');
			var count = $("#my-task-list").attr('data-count')*1;
			if($li.hasClass('unread')) {
				$.post($(this).attr('href'),{},function(response) {
					if(response.success) {
						$('.notification-'+ID).removeClass('unread');
						$("#my-task-list").attr('data-count',(count-1));
						updateMessageCount();
					}
					else {
						fancyAlert(response.error);
					}
				});
			}
			else {
				//$li.addClass('unread');
				//$("#my-task-list").attr('data-count',(count+1));
				//updateMessageCount();
			}
		});
	}
	/********** alerts *******************/
	if($("#alerts-container").length>0) {
		getAlerts(true);
	}
	
	/********** server time *******************/
	if($("#time-container").length>0) {
		getServerTime();
	}
	
	/*********** orders *********************/
	if($("#orders-container").length>0 || $("#market-orders-container").length>0) {
		getOrders(true);
		$(document).on('click','.accept-order',function (e) { 
			if($(this).hasClass('change-order')) {
				var msg = 'Esti sigur ca vrei sa modifici ordinul tau pentru a corespunde cu aceasta varianta?';
				//var $el = $(this).parents('.suborder');
				var match_id = $(this).attr('rel');
				var $el = $("#combination-"+match_id);
				var order_id = $el.attr('rel');
				fancyConfirm(msg,function(r){ 
					if(r) {
						log('match id:'+ match_id);
						log('order id:'+ order_id);
						//var $order = $("#order-"+order_id);
						var item = orders[searchIdInArray(order_id,orders)];
						var changes = item.matches[searchIdInArray(match_id,item.matches)];
						var d1 = moment(changes.StartDeliveryDate);
						var d2 = moment(changes.EndDeliveryDate);
						$.post('/orders/edit/'+order_id, {Direction:item.Direction, Price:$.number(changes.Price,2,',','.'), Quantity:$.number(changes.Quantity,3,',','.'), StartDeliveryDate:d1.format('DD MMM YYYY'), EndDeliveryDate:d2.format('DD MMM YYYY'), CombinationsAccepted: item.CombinationsAccepted, ID_GNType:item.ID_GNType}, function(response,textStatus) {
							log(response);
							if(response.Success) {
								//closeOrder(order_id);
								var $order = $('#order-'+order_id);
								$order.addClass('closed').addClass('closing');
								$order.find('.controller').remove();
								$order.find('.tile-title .order-price').html($.number(changes.Price,2,',','.')+' <span class="muted">Lei</span>');
								$order.find('.tile-body').html($el.find('.tile-body').html());
								$order.find('.tile-body .order-control').addClass('order-details');
								$order.find('.tile-body .order-middle').html($order.find(".order-header .order-quantity").html());
								//$order.find('.tile-body .order-sections').removeClass('pull-left').addClass('pull-right');
								$('#suborders-'+order_id).remove();
								//setTimeout(function(){
									//$order.effect('highlight',3000,function(){ 
										//$order.remove();
										//appendNewTransaction(orders[$order.attr('id').replace('order-','')]);
									//});
									//$order.fadeOut(); 
								//},500);
								//closeOrder(order_id);
							}
							else {
								fancyAlert(response.Result);
							}
						});
					}
				});
			}
			else {
				var msg = 'Esti sigur ca vrei sa accepti aceasta varianta?';
				//if(confirm(msg)) {
				var $el = $(this).parents('.suborder');
				var match_id = $(this).attr('rel');
				var order_id = $el.attr('rel');
				fancyConfirm(msg,function(r){ 
					if(r) {
						log('match id:'+ match_id);
						log('order id:'+ order_id);
						//var $order = $("#order-"+order_id);
						socket.get('/orders/accept', {id:match_id}, function(response) {
							log(response);
							if(response.success) {
								//closeOrder($el.attr('rel'));
								var $order = $('#order-'+order_id);
								$order.addClass('closed');
								$order.find('.controller').remove();
								$order.find('.tile-body').html($el.find('.tile-body').html());
								$order.find('.tile-body .order-control').addClass('order-details');
								$order.find('.tile-body .order-middle').html($order.find(".order-header .order-quantity").html());
								//$order.find('.tile-body .order-sections').removeClass('pull-left').addClass('pull-right');
								$('#suborders-'+order_id).remove();
								//setTimeout(function(){
									$order.effect('highlight',5000,function(){ 
										$order.remove();
										//appendNewTransaction(orders[$order.attr('id').replace('order-','')]);
									});
									//$order.fadeOut(); 
								//},500);
								//closeOrder(order_id);
							}
						});
					}
				});
			}
			e.preventDefault();
		});
		$(document).on('click','.add-order-button',function (e) { 
			$container = $("#order-form-container");
			$orderform = $("#order-form");
			var type = $(this).attr('data-type');
			$(".order-action-title").html('Adaugare');
			$("#order-submit").html('Lansati Ordinul');
			$("#order-suspend").hide();
			$("#EntryPoints").val('');
			$("#entrypoints-list").html('');
			startDate = new Date(startDateOffset.format());
			endDate = new Date(endDateOffset.format());
			$('#order-StartDeliveryDate').datepicker('setEndDate', endDate);
			$('#order-EndDeliveryDate').datepicker('setStartDate', startDate);
			if(type=='B') {
				$(".order-direction-holder").html('cumparare');
				$("#order-Direction").val(type);
				$(".combinationsAccepted-holder").hide();
				$(".entryPoints-holder").hide();
			}
			else {
				$(".order-direction-holder").html('vanzare');
				$("#order-Direction").val(type);
				$(".combinationsAccepted-holder").show();
				$(".entryPoints-holder").show();
			}
			socket.get('/home/userEntrypoints',{}, function(response) {
				if(response.success) {
					$("#EntryPoints").val('');
					var ep;
					$("#entrypoints-list").html('');
					$("#entrypoints-list-checkbox").html('');
					$.each(response.data,function(idx){
						ep = response.data[idx];
						$("#entrypoints-list").append('<li id="ep-'+ep.ID+'"><div class="btn btn-white btn-small"><a class="remove-entrypoint">&nbsp;&nbsp;<i class="fa fa-times-circle"></i></a>'+(ep.PhysicalPointCode?ep.PhysicalPointCode:ep.VirtualPointCode)+'</div></li>');
						$("#entrypoints-list-checkbox").append('<li>'+
						'<div class="checkbox check-default">'+
								'<input id="ep-check-'+ep.ID+'" name="EntryPoints[]" type="checkbox" value="'+ep.ID+'" data-id="'+ep.ID+'" data-label="'+(ep.PhysicalPointCode?ep.PhysicalPointCode:ep.VirtualPointCode)+'" checked="" />'+
								'<label for="ep-check-'+ep.ID+'">'+(ep.PhysicalPointCode?ep.PhysicalPointCode:ep.VirtualPointCode)+'</label>'+
						'</div></li>');
					});
					
					$("#orders-container").hide();
					$container.fadeIn();
					$('html, body').animate({
						scrollTop: $container.offset().top
					}, 400);
				}
				else fancyAlert('A intervenit o eroare la obtinerea punctelor de intrare predefinite! '+response.error);
			});
			e.preventDefault();
		});
		
		$(document).on('click','.edit-order-button',function (e) { 
			$container = $("#order-form-container");
			$orderform = $("#order-form");
			$("#order-suspend").show();
			var item = orders[searchIdInArray($(this).attr('data-value'),orders)];
			socket.get('/orders/entrypoints/'+item.ID, {}, function(response) {
				if(response.success) {
					$("#EntryPoints").val('');
					var ep;
					$("#entrypoints-list").html('');
					$("#entrypoints-list-checkbox").html('');
					$.each(response.data,function(idx){
						ep = response.data[idx];
						$("#entrypoints-list").append('<li id="ep-'+ep.ID+'"><div class="btn btn-white btn-small"><a class="remove-entrypoint">&nbsp;&nbsp;<i class="fa fa-times-circle"></i></a>'+(ep.PhysicalPointCode?ep.PhysicalPointCode:ep.VirtualPointCode)+'</div></li>');
						$("#entrypoints-list-checkbox").append('<li>'+
						'<div class="checkbox check-default">'+
								'<input id="ep-check-'+ep.ID+'" name="EntryPoints[]" type="checkbox" value="'+ep.ID+'" data-id="'+ep.ID+'" data-label="'+(ep.PhysicalPointCode?ep.PhysicalPointCode:ep.VirtualPointCode)+'" checked="" />'+
								'<label for="ep-check-'+ep.ID+'">'+(ep.PhysicalPointCode?ep.PhysicalPointCode:ep.VirtualPointCode)+'</label>'+
						'</div></li>');
					});
					
					$("#order-ID").val(item.ID);
					$("#order-Direction").val(item.Direction);
					$("#order-Quantity").val($.number(item.Quantity,3,',','.'));
					$("#order-Price").val($.number(item.Price,2,',','.'));
					$("#ID_GNType").val(item.ID_GNType);
					$("#ID_GNType").select2('val',item.ID_GNType);
					var d1 = new moment(item.StartDeliveryDate);
					var d2 = new moment(item.EndDeliveryDate);
					$("#order-StartDeliveryDate").val(d1.format('D MMM YYYY'));
					$("#order-EndDeliveryDate").val(d2.format('D MMM YYYY'));
					if(item.Direction=='S' && item.CombinationsAccepted) $("#order-CombinationsAccepted").attr('checked',true);
					else $("#order-CombinationsAccepted").removeAttr('checked');
					

					$(".order-action-title").html('Modificare');
					$("#order-submit").html('Modifica');
					if(item.Direction=='B') {
						$(".order-direction-holder").html('cumparare');
						$(".combinationsAccepted-holder").hide();
						$(".entryPoints-holder").hide();
					}
					else {
						$(".order-direction-holder").html('vanzare');
						$(".combinationsAccepted-holder").show();
						$(".entryPoints-holder").show();
					}
					$orderform.addClass('edit-form');
					$("#orders-container").hide();
					$container.fadeIn();
					$('html, body').animate({
						scrollTop: $container.offset().top
					}, 400);

				}
				else fancyAlert('A intervenit o eroare la modificarea ordinului! '+response.error);
			});
			e.preventDefault();
		});
		
		$(document).on('click','.add-matching-order',function (e) { 
			$container = $("#order-form-container");
			$orderform = $("#order-form");
			$("#order-suspend").hide();
			var item = orders[searchIdInArray($(this).attr('data-value'),orders)];
			$("#EntryPoints").val('');
			$("#entrypoints-list").html('');
			$("#order-Direction").val(item.Direction=='B'?'S':'B');
			$("#order-Quantity").val($.number(item.Quantity,3,',','.'));
			$("#order-Price").val($.number(item.Price,2,',','.'));
			$("#ID_GNType").val(item.ID_GNType);
			$("#ID_GNType").select2('val',item.ID_GNType);
			var d1 = new moment(item.StartDeliveryDate);
			var d2 = new moment(item.EndDeliveryDate);
			$("#order-StartDeliveryDate").val(d1.format('D MMM YYYY'));
			$("#order-EndDeliveryDate").val(d2.format('D MMM YYYY'));
			$("#order-CombinationsAccepted").removeAttr('checked');
					

			$(".order-action-title").html('Adaugare');
			$("#order-submit").html('Adauga');
			if(item.Direction=='B') {
				$(".order-direction-holder").html('vanzare');
				$(".combinationsAccepted-holder").show();
				$(".entryPoints-holder").show();
			}
			else {
				$(".order-direction-holder").html('cumparare');
				$(".combinationsAccepted-holder").hide();
				$(".entryPoints-holder").hide();
			}
			$("#orders-container").hide();
			$container.fadeIn();
			$('html, body').animate({
				scrollTop: $container.offset().top
			}, 400);

			e.preventDefault();
		});
		
		$(document).on('click','#order-cancel',function (e) { 
			document.getElementById('order-form').reset();
			startDate = new Date(startDateOffset.format());
			endDate = new Date(endDateOffset.format());
			$('#order-StartDeliveryDate').datepicker('setEndDate', endDate);
			$('#order-EndDeliveryDate').datepicker('setStartDate', startDate);

			var $container = $("#order-form-container");
			var $orderform = $("#order-form");
			$container.fadeOut();
			$orderform.find(".error").remove();
			$orderform.removeClass('edit-form');
			$("#precheck-container").hide();
			$("#orders-container").show();
			$('html, body').animate({
				scrollTop: $("#orders-container").offset().top
			}, 400);
			e.preventDefault();
		});
		
		$(document).on('click','#precheck',function (e) { 
			var $container = $("#precheck-container");
			var $orderform = $("#order-form");
			var $ordersList = $("#precheck-list");
			var ok = true;
			$orderform.find(".error").remove();
			$ordersList.html('');
			$.post('/orders/validate',$orderform.serialize(),function(data,textStatus){
				if(!data.Success && data.ResultType=='JSONKeyValuePairStruct') {
					log('validation errors');
					for(var i in data.Result) {
						if(data.Result[i]!='') {
							$('<span class="error">'+data.Result[i]+'</span>').insertAfter($("input[name='"+i+"']").parent());
							ok = false;
						}
					}
				}
				if(ok) {
					$container.show();
					$.post('/orders/precheck', $orderform.serialize(), function(response,textStatus) {
						if(response.Success) {
							if(response.data.length>0) {
								for (var i=0;i<response.data.length;i++) {
									var item = response.data[i];
									var d1 = new moment(item.StartDeliveryDate);
									var d2 = new moment(item.EndDeliveryDate);
									var d3 = new moment(item.Date);
									var html = '<li id="market-order-'+item.ID+'" class="market-order">'+
										'<div class="market-order-col col-status" data-value="'+d3.format('X')+'">'+
											'<span>' + d3.format('DD MMM HH:mm') + '</span>'+
										'</div>'+
										'<div class="market-order-col col-type" data-value="'+(item.Direction=='B'?'Cumparare':'Vanzare')+'"><span>'+
											(item.Direction=='B'?'Cumparare':'Vanzare')+
										'</span></div>'+
										'<div class="market-order-col col-type2" data-value="'+(item.GNTypeCode?item.GNTypeCode:'')+'">'+
											(item.GNTypeCode?item.GNTypeCode:'&nbsp;')+
										'</div>'+
										'<div class="market-order-col col-date" data-value="'+d1.format('DD MMM')+'">'+
											'<span>'+d1.format('DD MMM')+' - '+d2.format('DD MMM')+'</span>'+
										'</div>'+
										'<div class="market-order-col col-quantity" data-value="'+item.Quantity+'">'+
											item.Quantity+' <span class="muted">MWh</span>'+
										'</div>'+
										'<div class="market-order-col col-price" data-value="'+item.Price+'">'+
											item.Price+' <span class="muted">Lei</span>'+
										'</div>'+
									'</li>';
									$ordersList.append(html);
								}
							}
							else {
								$ordersList.html('<li class="empty-message"><div class="text-center padding-10">Nu exista ordine compatibile.</div></li>');
							}
						}
						else {
							log('error loading orders ('+response.error+')');
						}
					});
				}
			});
			e.preventDefault();
		});
		
		$(document).on('click','.cancel-order-button',function (e) { 
			var $orderform = $("#order-form");
			var ok = true;
			var $orderId = $(this).attr('data-value');
			var $url = $(this).attr('href');
			fancyConfirm('Esti sigur ca vrei sa anulezi ordinul?',function(r){ 
				if(r) {
					$.post($url,{},function(data,textStatus){
						if(!data.Success) {
							if(data.ResultType=='JSONKeyValuePairStruct') {
								fancyAlert(data.Result);
								ok = false;
							}
							else if(data.ResultType=='GeneralError' || data.ResultType=='String') {
								fancyAlert(data.Result);
							}
						}
						else if(data.Success) {
							deleteOrder($orderId);
						}
					});
				}
			});
			e.preventDefault();
		});
		
		
		$('#order-form').submit(function(e){
			var ok = true;
			var $form = $(this);
			$('#order-form').find(".error").remove();
			/*
			$('#order-form').find(".required").each(function(elm){
				if($.trim($(this).val())=='') {
					$('<span class="error">Campul este obligatoriu.</span>').insertAfter($(this).parent());
					ok = false;
				}
			});
			*/
			if(ok) {
				$.post('/orders/validate',$('#order-form').serialize(),function(data,textStatus){
					log(data);
					if(!data.Success && data.ResultType=='JSONKeyValuePairStruct') {
						log('validation errors');
						for(var i in data.Result) {
							if(data.Result[i]!='') {
								$('<span class="error">'+data.Result[i]+'</span>').insertAfter($("input[name='"+i+"']").parent());
								ok = false;
							}
						}
					}
					if(ok) {
						var verb = ($form.hasClass('edit-form')?'modifici':'adaugi');
						//if(confirm('Esti sigur ca vrei sa '+verb+' ordinul?')) document.getElementById('order-form').submit();
						fancyConfirm('Esti sigur ca vrei sa '+verb+' ordinul?',function(r){ 
							if(r) {
								$.post(($form.hasClass('edit-form')?'/orders/edit/'+$("#order-ID").val():'/orders/add'),$('#order-form').serialize(),function(data,textStatus){
									if(!data.Success) {
										if(data.ResultType=='JSONKeyValuePairStruct') {
											for(var i in data.Result) {
												if(data.Result[i]!='') {
													$('<span class="error">'+data.Result[i]+'</span>').insertAfter($("input[name='"+i+"']").parent());
													ok = false;
												}
											}
										}
										else if(data.ResultType=='GeneralError' || data.ResultType=='String') {
											fancyAlert(data.Result);
										}
									}
									else if(data.Success) {
										document.getElementById('order-form').reset();
										$container = $("#order-form-container");
										$orderform = $("#order-form");
										$container.fadeOut();
										$orderform.removeClass('edit-form');
										$("#orders-container").show();
										$('html, body').animate({
											scrollTop: $("#orders-container").offset().top
										}, 400);
									}
								});
							}
						});
					}
				});
			}
			e.preventDefault();
		});	
		
		$('#order-StartDeliveryDate').datepicker({
			dateFormat:'dd M yyyy',
			startDate:startDate,
			endDate:endDate,
			autoclose:true,
			orientation:'auto top'
		}).on('changeDate', function(selected){
			startDate = new Date(selected.date.valueOf());
			startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
			$('#order-EndDeliveryDate').datepicker('setStartDate', startDate);
		});
		$('#order-EndDeliveryDate').datepicker({
			dateFormat:'dd M yyyy',
			startDate: startDate,
			endDate: endDate,
			autoclose: true,
			orientation:'auto top'
		}).on('changeDate', function(selected){
			endDate = new Date(selected.date.valueOf());
			endDate.setDate(endDate.getDate(new Date(selected.date.valueOf())));
			$('#order-StartDeliveryDate').datepicker('setEndDate', endDate);
		});

		$("#entrypoints-picker").fancybox({
			autoResize:true,
			width:800,
			maxWidth:1000,
			afterClose: function() {
			},
			afterLoad: function() {
				socket.get('/home/entrypoints', {}, function(response) {
					if(response.success) {
						var item;
						$("#entrypoints-list-checkbox").html('');
						
						var pep = '<table class="table no-more-tables">'+
							'<thead>'+
								'<tr>'+
									'<th width="10%">&nbsp;</th>'+
									'<th width="25%">Cod punct fizic</th>'+
									'<th width="40%">Denumire punct fizic</th>'+
									'<th width="25%">Tipuri de gaz</th>'+
								'</tr>'+
							'</thead>'+
							'<tbody>';
						var vep = '<table class="table no-more-tables">'+
							'<thead>'+
								'<tr>'+
									'<th width="10%">&nbsp;</th>'+
									'<th width="25%">Cod punct virtual</th>'+
									'<th width="40%">Denumire punct virtual</th>'+
									'<th width="25%">Tipuri de gaz</th>'+
								'</tr>'+
							'</thead>'+
							'<tbody>';
						$.each(response.data,function(idx){
							item = response.data[idx];
							var types_string = [];
							if(typeof item.GNTypes!='undefined') {
								var gn = $.parseJSON(item.GNTypes);
								$.each(gn,function(idx2){
									types_string.push(gntypes[searchIdInArray(gn[idx2],gntypes)].Code);
								});
							}
							if(item.PhysicalPointCode) {
								pep += '<tr>'+
									'<td>'+
										'<div class="checkbox check-default">'+
											'<input id="ep-check-'+item.ID+'" name="EntryPoints[]" type="checkbox" value="'+item.ID+'" data-id="'+item.ID+'" data-label="'+item.PhysicalPointCode+'" '+($("#ep-"+item.ID).length>0?'checked=""':'')+'/>'+
											'<label for="ep-check-'+item.ID+'">&nbsp;</label>'+
										'</div>'+
									'</td>'+
									'<td>'+
										'<label for="ep-check-'+item.ID+'">'+ item.PhysicalPointCode +'</label>'+
									'</td>'+
									'<td>'+ item.PhysicalPointName + '</td>'+
									'<td>'+ types_string.join(', ') + '</td>'+
								'</tr>';
							}
							else {
								vep += '<tr>'+
									'<td>'+
										'<div class="checkbox check-default">'+
											'<input id="ep-check-'+item.ID+'" name="EntryPoints[]" type="checkbox" value="'+item.ID+'" data-id="'+item.ID+'" data-label="'+item.VirtualPointCode+'" '+($("#ep-"+item.ID).length>0?'checked=""':'')+'/>'+
										'<label for="ep-check-'+item.ID+'">&nbsp;</label>'+
										'</div>'+
									'</td>'+
									'<td>'+
										'<label for="ep-check-'+item.ID+'">'+ item.VirtualPointCode +'</label>'+
									'</td>'+
									'<td>'+ item.VirtualPointName + '</td>'+
									'<td>'+ types_string.join(', ') + '</td>'+
								'</tr>';
							}
						});
						vep += '</tbody></table>';
						pep += '</tbody></table>';
						
						$("#entrypoints-list-checkbox").append(vep+pep);
					}
				});
				$(document).on('click',".entrypoints-fancy-save",function(e){
					e.preventDefault();
					$("#entrypoints-list").html('');
					$("#entrypoints-list-checkbox input:checked").each(function(){
						$("#entrypoints-list").append('<li id="ep-'+$(this).attr('data-id')+'"><div class="btn btn-white btn-small"><a class="remove-entrypoint">&nbsp;&nbsp;<i class="fa fa-times-circle"></i></a>'+$(this).attr('data-label')+'</div></li>');
					});
					$.fancybox.close();
				});
			}
		});
		$(document).on('click',"#validate-entrypoints",function(e){
			$("#entrypoints-list").html('');
			socket.get('/home/entrypoints', {}, function(response) {
				if(response.success) {
					var str = $.trim($("#EntryPoints").val());
					var items = str.split(',');
					var x,c=0;
					for(var i=0;i<items.length;i++) {
						if($.trim(items[i])!='') {
							x = $.trim(items[i]);
							log(x);
							for(var j=0;j<response.data.length;j++) {
								if((response.data[j].PhysicalPointCode && response.data[j].PhysicalPointCode==x) || (response.data[j].VirtualPointCode && response.data[j].VirtualPointCode==x)) {
									$("#entrypoints-list").append('<li id="ep-'+response.data[j].ID+'"><div class="btn btn-white btn-small"><a class="remove-entrypoint">&nbsp;&nbsp;<i class="fa fa-times-circle"></i></a>'+(response.data[j].PhysicalPointCode?response.data[j].PhysicalPointCode:response.data[j].VirtualPointCode)+'</div></li>');
									c++;
								}
							}
						}
					}
					fancyAlert('Au fost confirmate '+c+' puncte de intrare');
				}
				else {
					fancyAlert('Nu s-a putut verifica lista de puncte de intrare! Va rugam sa mai incercati o data.');
				}
			});
			e.preventDefault();
		});
		$(document).on('click',".remove-entrypoint",function(e){
			$(this).parent().parent().remove();
			e.preventDefault();
		});
		/*
		$("#entrypoints-picker").click(function(e){
			e.preventDefault();
		});
		*/

		$(document).on('mouseenter',".order-sections .section.narrowed",function(e){
			$(this).parent().find('.inner-section').show();
			log();
		});
		$(document).on('mouseleave',".order-sections .section.narrowed .inner-section",function(e){
			$(this).hide();
		});
	}

	/************** market orders ***********/

	
	/*************** chart ***************/
	if($("#market-chart").length>0) {
		var data_price = [];
		var data_vol = [];
		socket.get('/home/chart', {}, function(response) {
			//log(response);
			if(response.success) {
				for(var i=0;i<response.data.length;i++) {
					var item = response.data[i];
					var d = new Date();
					var month = d.getMonth()+1;
					var day = d.getDate();
					//log(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z');
					//log(moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X'));
					//data_price.push([moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, item.Open, item.Max, item.Min, item.Close]);
					//data_vol.push([moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, item.Volume]);
					data_price.push({id:item.ID,x:moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, open:item.Open, high:item.Max, low:item.Min, close:item.Close});
					data_vol.push({id:item.ID,x:moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, y:item.Volume});
					chart_ticks.push(item.ID);
				}
				if(response.data.length>0) last_chart_ticks = d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick;
				//log(data);
			}
			var groupingUnits = [
				[
					'minute', // unit name
					[1] // allowed multiples
				],
				[
					'month',
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
				]
			];
			//if(data_price.length>0) {
				chart = new Highcharts.StockChart({
					 chart: {
						renderTo: 'market-chart',
						type: 'candlestick'
					 },
					 rangeSelector : {
						inputEnabled: $('#market-chart').width() > 480,
						selected : 1,
						enabled: false
					},
					yAxis: [{
						labels: {
							align: 'left',
							x: -3
						},
						title: {
							text: 'Pret'
						},
						height: '70%',
						floor: 0,
						lineWidth: 2
					}, {
						labels: {
							align: 'left',
							x: -3
						},
						title: {
							text: 'Cantitate'
						},
						top: '75%',
						height: '25%',
						offset: 0,
						lineWidth: 2
					}],
					/*
					navigator: {
						baseSeries: 1
					},*/
					series : [{
						type : 'candlestick',
						name : 'Pret',
						data : data_price,
						dataGrouping : {
							units : groupingUnits
						}
					}, {
						type: 'column',
						name: 'Cantitate',
						data: data_vol,
						yAxis: 1,
						dataGrouping: {
							units: groupingUnits
						}
					}]
				});
			//}
		});
	}

	getGNTypes();
	//getWhitelist();
});
 


/****** application logic ************/

$(function() {
	$(window).focus(function() {
		live = true;
		//log('focus');
		// connect to socket
		//socket.reconnect();
		// reload everything
		getServerTime();
	});

	$(window).blur(function() {
		live = false;
		//log('blur');
		// disconnect socket
		//socket.disconnect('buh bye!');
	});
});
	
$(document).ready(function(){

	(function (io) {
		var socket = io.connect();
		//var socket = io.connect('/',{'sync disconnect on unload':true});
		if (typeof console !== 'undefined') {
			log('Connecting to Sails.js...');
		}

		socket.on('connect', function socketConnected() {

			log("This is from the connect: ", this.socket.sessionid);
	
			/*
			socket.get('/home/subscribe', {}, function gotResponse (response) {
				if(response.Success) {
					log('subscribed to channel!' + response.Result);
					$.event.trigger({type:'socketConnected'});
				}
				else {
					showRelogin(response.Result);
				}
			});
			*/
			socket.get('/home/subscribe', {}, function gotResponse () {
				log('subscribed to channel!');
				$.event.trigger({type:'socketConnected'});
			});
		
			socket.on('message', function messageReceived(message) {

				///////////////////////////////////////////////////////////
				// Replace the following with your own custom logic
				// to run when a new message arrives from the Sails.js
				// server.
				///////////////////////////////////////////////////////////
				log('New comet message received :: '+ message.model+' '+message.verb+' '+message.id);
				//////////////////////////////////////////////////////
				if (message.model === 'chat'  && message.verb === 'create') {
					appendNewMessage(message.data.item);
					$("#chat-container .scroller").slimScroll({ scrollTo: $("#chat-list").outerHeight(true)+'px' });
				}
				if (message.model === 'order') {
					if(message.verb=='destroy') {
						deleteOrder(message.id);
					}
					else {
						processOrder(message.data.item);
						if(message.verb=='create') updateRingSessionStats();
					}
					/*if(message.data.item.ID_Broker == b_id)	appendNewOrder(message.data.item);
					else appendNewMarketOrder(message.data.item);
					*/
				}
				if (message.model === 'transaction') {
					if($("#transactions-container").length>0) {
						getTransactions(false);
					}
					else if($("#all-transactions-container").length>0) {
						getAllTransactions(false);
					}
					else getTransactions(false);
					updateRingSessionStats();
					updateChart();
				}
				if (message.model === 'ringsession') {
					updateRingSessionStats();
				}
				if (message.model === 'alert') {
					//$("#alerts-list").prepend('<li>'+$("#alerts-container .first-alert").html()+'</li>');
					$("#alerts-list").prepend('<li id="alert-' + message.data.item.ID + '"><span class="muted time-label">' + moment(message.data.item.Date).format("DD MMM HH:mm") + '</span> <span class="alert-label">' + message.data.item.Message + '<span></li>');
					$("#main-alert").html('<p class="alert first-alert"><span class="muted">' + moment(message.data.item.Date).format("DD MMM HH:mm") + '</span> ' + message.data.item.Message + '</p>');
					$("#alerts-container").effect('pulsate','slow');
					updateRingSessionStats();
					updateChart();
				}
				if (message.model === 'journal') {
					appendJournal(message.data.item);
					if(table_api.length>0) table_api.fnDraw();
					if($("#users-container").length>0) getUsers();
				}
				if (message.model === 'user') {
					if($("#users-container").length>0) getUsers(true);
				}
				getMarketParams();
			});
		});
		socket.on('disconnect', function disconnectSocket(message) {
		 log('server disconnected :: ', message);
		});
		window.socket = socket;
	})(window.io);
	
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


/************* view helper functions *******************/

function updateChart() {
	if(!chart_processing) {
		chart_processing = true;
		socket.get('/home/chart', {since:last_chart_ticks}, function(response) {
			//log(response);
			if(response.success && chart) {
				var new_data_price = [];
				var new_data_vol = [];
				var new_chart_ticks = [];
				for(var i=0;i<response.data.length;i++) {
					var item = response.data[i];
					var d = new Date();
					var month = d.getMonth()+1;
					var day = d.getDate();
					var tick = moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000;
					
					new_data_price.push({id:item.ID,x:moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, open:item.Open, high:item.Max, low:item.Min, close:item.Close});
					new_data_vol.push({id:item.ID,x:moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, y:item.Volume});
					new_chart_ticks.push(item.ID);
				}
					
					chart.series[0].update({data:new_data_price});
					chart.series[1].update({data:new_data_vol});
					log('market chart updated!!');
					/*
					if(chart_ticks.indexOf(item.ID)>-1) {
						log('chart tick exists');
						//update chart point
						var idx = searchXinArray(tick,chart.series[0].points);
						if(idx>-1) {
							//chart.series[0].points[idx].update({id:item.ID,x:tick, open:item.Open, high:item.Max, low:item.Min, close:item.Close});
							//chart.series[1].points[idx].update({id:item.ID+'_2',x:tick, y:item.Volume});
							chart.series[0].points[idx].update({id:item.ID, open:item.Open, high:item.Max, low:item.Min, close:item.Close});
							chart.series[1].points[idx].update({id:item.ID+'_2', y:item.Volume});
						}
					}
					else {
						log('new chart tick !');
						if(chart_ticks[chart_ticks.length-1].x<=tick) {
						// add point
						chart_ticks.push(item.ID);
						//data_price.push({id:item.ID,x:moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, open:item.Open, high:item.Max, low:item.Min, close:item.Close});
						//data_vol.push({id:item.ID,x:moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, y:item.Volume});
						chart.series[0].addPoint({id:item.ID,x:moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, open:item.Open, high:item.Max, low:item.Min, close:item.Close});
						chart.series[1].addPoint({id:item.ID+'_2',x:moment(d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick+'.00Z').format('X')*1000, y:item.Volume});
						}
						else log('chart tick is before last tick in series');
					}
					*/

				if(response.data.length>0) last_chart_ticks = d.getFullYear()+'-'+(month>9?month:'0'+month)+'-'+(day>9?day:'0'+day)+'T'+item.Tick;
				//log(data);
				chart_processing = false;
			}
			else {
				chart_processing = false;
			}
		});
	}
}

function getGNTypes() {
	socket.get('/home/gntypes', {}, function(response) {
		if(response.success) {
			gntypes = response.data;
		}
		else {
			log('error loading gas types ('+response.error+')');
		}
	});
}

function getWhitelist() {
	socket.get('/home/whitelist', {}, function(response) {
		if(response.success) {
			whitelist = response.data;
		}
		else {
			log('error loading whitelist ('+response.error+')');
		}
	});
}

function getServerTime() {
	socket.get('/home/time', {}, function(response) {
		if(response.success) {
			time = new moment(response.data);
			if(time_interval) clearInterval(time_interval);
			time_interval = setInterval(function(){
				time.add('seconds',1);
				$("#server-time").html(time.format('HH[<span class="time-dots">:</span>]mm [<span class="daytime">]A[</span>]'));
				$("#server-time .time-dots").animate({opacity:0},800,function(){$("#server-time .time-dots").css({opacity:1})});
				if(Date.now()%60==0) {
					updateChart();
				}
			},1000);
		}
		else {
			log('error loading server time ('+response.error+')');
		}
	});
}

function getMarketParams() {
	socket.get('/home/params', {}, function(response) {
		if(response.success) {
			startDateOffset = new moment().add('days', response.data.StartDeliveryDateOffset);
			startDate = new Date(startDateOffset.format());
			endDateOffset = new moment().add('days', response.data.EndDeliveryDateOffset);
			endDate = new Date(endDateOffset.format());
			log('market params updated!');
		}
		else {
			log('error loading market params ('+response.error+')');
		}
	});
}

function getOrders(clear) {
	socket.get('/orders/index', {all:true}, function(response) {
		if(response.success) {
			var $ordersList = $("#orders-list");
			var $marketOrdersList = $("#market-orders-list");
			if(response.data.length>0) {
				if(clear) {
					$ordersList.html('');
					$marketOrdersList.html('');
				}
				for (var i=0;i<response.data.length;i++) {
					processOrder(response.data[i]);
				}
				arrangeOrders();
				arrangeMarketOrders();
				sortMarketOrdersList();
			}
			else {
				if(clear) {
					$ordersList.html('<div class="tiles white m-b-10 empty-message"><div class="tiles-body text-center">Nu exista ordine active.</div></div>');
					$marketOrdersList.html('<li class="empty-message"><div class="text-center padding-10">Nu exista ordine disponibile in piata.</div></li>');
				}
			}
		}
		else {
			log('error loading orders ('+response.error+')');
		}
	});
}

function getTransactions(clear) {
	var since = $("#transactions-container").data('since');
	socket.get('/transactions/index', {since:since}, function(response) {
		if(response.success) {
			log('receiving '+response.data.length+' transactions')
			if(response.data.length>0) {
				if(clear || $("#transaction-list").length==0) {
					$("#transactions-container .tile-body").html('<table class="table no-more-tables no-margin tablesorter" id="transaction-list">'+
						'<thead>'+
							'<tr>'+
								'<th style="width:5%" class="">Ora</th>'+
								'<th style="width:9%" class="{sorter:\'text\'}">Tip</th>'+
								'<th style="width:12%">Client</th>'+
								'<th style="width:20%">Perioada</th>'+
								'<th style="width:22%">Cantitate <span>(MWh)</span></th>'+
								'<th style="width:15%">Pret <span>(Lei)</span></th>'+
								'<th style="width:14%" class="{sorter: false} no-sort">Raport</th>'+
							'</tr>'+
						'</thead>'+
						'<tbody>'+
						'</tbody>'+
					'</table>');
				}
				for (var i=0;i<response.data.length;i++) {
					appendNewTransaction(response.data[i]);
				}
				/*
				var t = setInterval(function(){
					socket.get('/transactions/index', {}, function(response) {
						if(response.success) {
							if(response.data.length>0) {
								for (var i=0;i<response.data.length;i++) {
									appendNewTransaction(response.data[i]);
								}
							}
						}
						else {
							log('error loading transactions ('+response.error+')');
						}
					});
				},2000);
				*/
				// add parser through the tablesorter addParser method 
				$.tablesorter.addParser({ 
					// set a unique id 
					id: 'price', 
					is: function(s) { 
						// return false so this parser is not auto detected 
						return false; 
					}, 
					format: function(s) { 
						// format your data for normalization 
						return s.replace(' Lei','').replace('.','').replace(',',''); 
					}, 
					// set type, either numeric or text 
					type: 'numeric' 
				});
				$.tablesorter.addParser({ 
					// set a unique id 
					id: 'quantity', 
					is: function(s) { 
						// return false so this parser is not auto detected 
						return false; 
					}, 
					format: function(s) { 
						// format your data for normalization 
						return s.replace(' MWh','').replace('.',''); 
					}, 
					// set type, either numeric or text 
					type: 'numeric' 
				});
				
				$("#transaction-list").tablesorter({ 
					cssHeader: 'header-column',
					headers: {
						0: {
						},
						1: {
						},
						2: {
						},
						3: {
						},
						4: {
							sorter:'quantity'
						},
						5: {
							sorter:'price'
						},
						6: {
							sorter:false
						}
					}
				});
			}
			else {
				if(clear) {
					log('clean up transactions..');
					$("#transactions-container .tile-body").html('<div class="text-center">Nici o tranzactie disponibila.</div>');
				}
			}
		}
		else {
			log('error loading transactions ('+response.error+')');
		}
	});
}

function getAllTransactions(clear) {
	log('updating all transactions')
	socket.get('/transactions/index', {all:true}, function(response) {
		if(response.success) {
			log('receiving '+response.data.length+' transactions')
			if(response.data.length>0) {
				if(clear || $("#all-transaction-list").length==0) {
					$("#all-transactions-container .tile-body").html('<table class="table no-more-tables no-margin tablesorter" id="all-transaction-list">'+
						'<thead>'+
							'<tr>'+
								'<th style="width:5%" class="">Ora</th>'+
								'<th style="width:16%" class="{sorter:\'text\'}">Vanzator</th>'+
								'<th style="width:16%" class="{sorter:\'text\'}">Cumparator</th>'+
								'<th style="width:20%">Perioada</th>'+
								'<th style="width:22%">Cantitate <span>(MWh)</span></th>'+
								'<th style="width:15%">Pret <span>(Lei)</span></th>'+
								'<th style="width:14%" class="{sorter: false} no-sort">Raport</th>'+
							'</tr>'+
						'</thead>'+
						'<tbody>'+
						'</tbody>'+
					'</table>');
				}
				for (var i=0;i<response.data.length;i++) {
					appendNewAllTransaction(response.data[i]);
				}
				/*
				var t = setInterval(function(){
					socket.get('/transactions/index', {}, function(response) {
						if(response.success) {
							if(response.data.length>0) {
								for (var i=0;i<response.data.length;i++) {
									appendNewTransaction(response.data[i]);
								}
							}
						}
						else {
							log('error loading transactions ('+response.error+')');
						}
					});
				},2000);
				*/
				// add parser through the tablesorter addParser method 
				$.tablesorter.addParser({ 
					// set a unique id 
					id: 'price', 
					is: function(s) { 
						// return false so this parser is not auto detected 
						return false; 
					}, 
					format: function(s) { 
						// format your data for normalization 
						return s.replace(' Lei','').replace('.','').replace(',',''); 
					}, 
					// set type, either numeric or text 
					type: 'numeric' 
				});
				$.tablesorter.addParser({ 
					// set a unique id 
					id: 'quantity', 
					is: function(s) { 
						// return false so this parser is not auto detected 
						return false; 
					}, 
					format: function(s) { 
						// format your data for normalization 
						return s.replace(' MWh','').replace('.',''); 
					}, 
					// set type, either numeric or text 
					type: 'numeric' 
				});
				
				$("#all-transaction-list").tablesorter({ 
					cssHeader: 'header-column',
					headers: {
						0: {
						},
						1: {
						},
						2: {
						},
						3: {
						},
						4: {
							sorter:'quantity'
						},
						5: {
							sorter:'price'
						},
						6: {
							sorter:false
						}
					}
				});
			}
			else {
				if(clear) {
					log('clean up all transactions..');
					$("#all-transactions-container .tile-body").html('<div class="text-center">Nici o tranzactie disponibila.</div>');
				}
			}
		}
		else {
			log('error loading all transactions ('+response.error+')');
		}
	});
}

function getUsers(clear) {
	log('updating users')
	socket.get('/home/users', {}, function(response) {
		if(response.success) {
			log('receiving '+response.data.length+' users')
			if(response.data.length>0) {
			console.log(response.data);
				if(clear) {
					$("#user-list").html('');
					users = [];
				}
				for (var i=0;i<response.data.length;i++) {
					appendUser(response.data[i]);
				}
			}
			else {
				if(clear) {
					log('clean up users..');
					$("#user-list").html('<li><div class="text-center">Nici un user activ.</div></li>');
				}
			}
		}
		else {
			log('error loading users ('+response.error+')');
		}
	});
}


function getChatMessages(clear) {
	socket.get('/chat', {since:$("#chat-list").attr('data-timestamp')}, function(response) {
		if(response.success) {
			$("#chat-list .loader").hide();
			if(response.data && response.data.length>0) {
				var $chatlist = $("#chat-list");
				if(clear) $chatlist.html('');
				for (var i=0;i<response.data.length;i++) {
					appendNewMessage(response.data[i]);
				}
				$("#chat-container .scroller").slimScroll({ scrollTo: $("#chat-list").outerHeight(true)+'px' });
			}
		}
		else {
			log('error loading chat history ('+response.error+')');
		}
	});
}
	
function getJournal(clear) {
	$("#example-table_wrapper").append('<div class="loader-overlayer"></div>');
	socket.get('/home/journal', {}, function(response) {
		if(response.success) {
			if(response.data && response.data.length>0) {
				for (var i=0;i<response.data.length;i++) {
					appendJournal(response.data[i]);
				}
				if(table_api.length>0) {
					table_api.fnDraw();
					$("#example-table_wrapper .loader-overlayer").remove();
				}
			}
		}
		else {
			log('error loading journal ('+response.error+')');
		}
	});
}
	
function getAlerts(clear) {
	socket.get('/home/alerts', {}, function(response) {
		if(response.success) {
			log(response.data);
			if(response.data && Object.keys(response.data).length>0) {
				var $alerts = $("#alerts-container");
				var items = [];
				//log(Object.keys(response.data));
				for(var i in (Object.keys(response.data))) {
				//log(i);
					items.push(response.data[Object.keys(response.data)[i]]);
				}
				//log(items);
				var item = items[items.length-1];
				//log(item);
				$("#main-alert").html('<p class="alert first-alert"><span class="muted time-label">' + moment(item.Date).format("DD MMM HH:mm") + '</span> <span class="alert-label">' + item.Message + '</span></p>');
				//if(items.length>1) {
					for (var i=items.length-1;i>=0 && items.length-i<12;i--) {
						appendAlert(items[i]);
					}
				//}
				//if($("#alert-"+item.ID).length==0) {
					//if(clear) $alerts.html('');
					//$alerts.append('<p class="alert" id="alert-' + item.ID + '"><span class="muted">' + moment(item.Date).format("DD MMM HH:mm") + '</span> ' + item.Message + '</p>');
					//$alerts.effect('pulsate','slow');
				//}
			}
		}
		else {
			log('error loading alerts ('+response.error+')');
		}
	});
	/*
	var t = setTimeout(function(){
		getAlerts(true);
	},2000);
	*/
}
	
function getNotifications(clear) {
	socket.get('/home/notifications', {since:last_notification}, function(response) {
		console.log(response);
		if(response.success) {
			log('notifications:');
			log(response.data);
			if(response.data && Object.keys(response.data).length>0) {
				//var $notifications = $("#notification-list");
				var count = 0;
				for (var i=response.data.length-1;i>=0;i--) {
					if(i>=response.data.length-10) appendNotification(response.data[i]);
					if(!response.data[i].isRead) count++;
				}
				var last_notification = response.data[0].Date;
				count += $("#my-task-list").attr('data-count')*1;
				$("#my-task-list").attr('data-count',count);
				$("#my-task-list .badge").html(count);
				if(count>0) $("#my-task-list .badge").addClass('badge-important');
			}
		}
		else {
			log('error loading notifications ('+response.error+')');
		}
	});
	/*
	var t = setTimeout(function(){
		getAlerts(true);
	},2000);
	*/
}
	
function appendAlert(item) {
	if(searchIdInArray(item.ID,alerts)==-1) {
		alerts.push(item);
		$("#alerts-list").append('<li id="alert-' + item.ID + '"><span class="muted time-label">' + moment(item.Date).format("DD MMM HH:mm") + '</span> <span class="alert-label">' + item.Message + '<span></li>');
	}
}

function appendJournal(item) {
	if(searchIdInArray(item.ID,journal)==-1) {
		journal.push(item);
		var date = new moment(item.Date);
		if(table_api.length>0) table_api.fnAddData([date.format('DD MMM YYYY HH:mm'), item.Operation, item.LoginName, item.AgencyName, (item.ID_Order?'#'+item.ID_Order:''), (item.Quantity?$.number(item.Quantity,3,',','.'):''), (item.Price?$.number(item.Price,2,',','.'):''), (item.GNTypeName?item.GNTypeName:'')],false);
	}
}

function appendNotification(item) {
	if(searchIdInArray(item.ID,notifications)==-1) {
		alerts.push(item);
		$("#notification-list .message-list").append('<li id="notification-' + item.ID + '" class="notification notification-' + item.ID + ' '+(item.isRead?'':'unread')+'"><div class="notification-timestamp">' + moment(item.Date).format("DD MMM HH:mm") + '</div> <div class="notification-from">' + (item.UserFrom?item.UserFrom:'Sistem') + '</div><div class="notification-subject">' + item.Subject + '</div><a class="notification-action" href="/home/readnotification/'+item.ID+'" data-id="'+item.ID+'"><i class="fa"></a></li>');
	}
}

function appendNewMessage(item) {
	if(typeof chat[item.ID]=='undefined') {	
		chat[item.ID] = item;
		$("#chat-list").attr('data-timestamp',item.Date);
		$("#chat-list").append('<li class="chat-message" id="chat-item-' + item.ID + '"><div class="timestamp pull-left">' + item.Date.substr(11,5) + '</div><div class="message pull-left"><span class="message-owner">' + item.LoginName + ':</span> ' + _.escape(item.Message) + '</div></li>');
		//$("#chat-container .scroller").slimScroll({ scrollTo: $("#chat-list").outerHeight(true)+'px' });
	}
}

function appendMarketOrder(item) {
	if($("#market-orders-container").length>0) {
		$("#market-orders-list").find('.empty-message').remove();
		var d1 = new moment(item.StartDeliveryDate);
		var d2 = new moment(item.EndDeliveryDate);
		var d3 = new moment(item.Date);
		var html = '<li id="market-order-'+item.ID+'" class="market-order'+(item.ID_Client==c_id?' self':'')+'">'+
			'<div class="market-order-col col-id" data-value="'+item.ID+'">'+
				'<span>#' + item.ID + '</span>'+
			'</div>'+
			'<div class="market-order-col col-status" data-value="'+d3.format('X')+'">'+
				'<span>' + d3.format('DD MMM HH:mm') + '</span>'+
			'</div>'+
			'<div class="market-order-col col-type" data-value="'+(item.Direction=='B'?'Cumparare':'Vanzare')+'"><span class="'+(item.Direction=='B'?'buy':'sell')+'">'+
				(item.Direction=='B'?'C':'V')+
			'</span></div>'+
			'<div class="market-order-col col-type2" data-value="'+(item.GNTypeCode?item.GNTypeCode:'')+'">'+
				(item.GNTypeCode?item.GNTypeCode:'&nbsp;')+
			'</div>'+
			'<div class="market-order-col col-date" data-value="'+d1.format('DD MMM')+'">'+
				'<span>'+d1.format('DD MMM')+' - '+d2.format('DD MMM')+'</span>'+
			'</div>'+
			'<div class="market-order-col col-quantity" data-value="'+item.Quantity+'">'+
				$.number(item.Quantity,3,',','.')+' <span class="muted">MWh</span>'+
			'</div>'+
			'<div class="market-order-col col-price" data-value="'+item.Price+'">'+
				$.number(item.Price,2,',','.')+' <span class="muted">Lei</span>'+
			'</div>'+
			'<div class="market-order-col col-action">'+
				((item.ID_Client==c_id || $("#market-orders-container").attr('data-allow-add') == '0') ?'&nbsp;':'<a class="tip add-matching-order" data-value="'+item.ID+'" data-toggle="tooltip" data-placement="left" data-original-title="Adauga ordin corespondent" title="Adauga ordin corespondent"><i class="fa fa-plus"></i></a>')+
				'&nbsp;&nbsp;<a class="tip" data-value="'+item.ID+'" data-toggle="popover" data-placement="right" data-html="true" data-container="#market-orders-container" data-trigger="hover" data-content="Puncte de intrare"><i class="fa fa-map-marker"></i></a>'+
			'</div>'+
		'</li>';
		if($("#market-order-"+item.ID).length>0) $("#market-order-"+item.ID).replaceWith(html);
		else $("#market-orders-list").append(html);
		arrangeMarketOrders();
		$("#market-order-"+item.ID).effect('highlight',2000);
		//$(".tip").tooltip();
		$("[data-toggle='popover']").popover();
	}
}

function appendNewTransaction(item) {
	if(searchIdInArray(item.ID,transactions)==-1) {
		log('new transaction '+item.ID);
		transactions.push(item);
		var d = new moment(item.Date);
		$("#transaction-list tbody").append('<tr>'+
			'<td class="v-align-middle">' + d.format('HH:mm') + '</td>'+
			'<td class="v-align-middle"><span class="' + (item.Direction=='S'?'sell':'buy') + ' semi-bold">' + (item.Direction=='S'?'V':'C') + '</span></td>'+
			'<td class="v-align-middle">' + (item.Direction=='S'?item.BuyClient:item.SellClient) + '</td>'+
			'<td class="v-align-middle">' + moment(item.StartDeliveryDate).format('DD MMM')+ ' - ' + moment(item.EndDeliveryDate).format('DD MMM') + '</td>'+
			'<td class="v-align-middle">' + $.number(item.Quantity,3,',','.') + '</td>'+
			'<td class="v-align-middle">' + $.number(item.Price,2,',','.') + '</td>'+
			'<td class="v-align-middle"><a class="report" href="/reports/download/' + item.ID + '" target="_blank">BRM ' + item.ID + '</a></td>'+
		'</tr>');
	}
}

function appendNewAllTransaction(item) {
	if(searchIdInArray(item.ID,all_transactions)==-1) {
		log('new all transaction '+item.ID);
		all_transactions.push(item);
		var d = new moment(item.Date);
		$("#all-transaction-list tbody").append('<tr>'+
			'<td class="v-align-middle">' + d.format('HH:mm') + '</td>'+
			'<td class="v-align-middle">' + item.SellClient + '</td>'+
			'<td class="v-align-middle">' + item.BuyClient + '</td>'+
			'<td class="v-align-middle" style="letter-spacing:-1px;">' + moment(item.StartDeliveryDate).format('DD MMM')+ ' - ' + moment(item.EndDeliveryDate).format('DD MMM') + '</td>'+
			'<td class="v-align-middle">' + $.number(item.Quantity,3,',','.') + '</td>'+
			'<td class="v-align-middle">' + $.number(item.Price,2,',','.') + '</td>'+
			'<td class="v-align-middle"><a class="report" href="/reports/download/' + item.ID + '" target="_blank">BRM ' + item.ID + '</a></td>'+
		'</tr>');
	}
}

function appendUser(item) {
	if(item && searchIdInArray(item.ID,users)==-1) {
		log('new user '+item.ID);
		users.push(item);
		$("#user-list").append('<li>'+
			'<p><strong>' + item.LoginName + '</strong> (' + item.FirstName + ' ' + item.LastName + ') - <em>' + item.CompanyName + '</em>' + '</p>'+
		'</li>');
	}
}

function closeOrder(id) {
	var $order = $('#order-'+id);
	var item = orders[searchIdInArray(id,orders)];
	if(!$order.hasClass('closed') || $order.hasClass('closing')) {
		if($order.hasClass("collapsed")) {
			$order.find(".tile-body").show();
			//if($(this).attr('rel')!='') $($(this).attr('rel')).show();
			$order.removeClass("collapsed");
			$order.find('.controller').remove();
			$('#suborders-'+id).hide();
		}
		socket.get('/orders/transactions', {id:id}, function(combination) {
			var html = '<div class="order-sections">';
			var mean = 0,total = 0,totalQuantity = 0;
			for(var i=0;i<combination.length;i++) {
				mean += combination[i].Quantity*combination[i].Price;
				totalQuantity += combination[i].Quantity;
				total += combination[i].Quantity*combination[i].Price;
				html += '<div class="section section' + (i+1) + '" style="width:' + (combination[i].Quantity*100/item.Quantity) + '%">'+
							'<div class="order-price"><strong>' + $.number(combination[i].Price,2,',','.') + ' Lei</strong><br/>per MWh</div>'+
							'<div class="order-quantity">' + $.number(combination[i].Quantity,3,',','.') + ' MWh</div>'+
							'<div class="order-company">' + moment(combination[i].StartDeliveryDate).format('DD/MM') + ' - ' + moment(combination[i].EndDeliveryDate).format('DD/MM') + '</div>'+
						'</div>';
			}
			mean = mean/totalQuantity;
			html += '</div>';
			html += '<div class="order-control order-details">'+
						'<div class="order-price"><span class="muted">Pret mediu</span><br/>' + $.number(Math.round(mean*100)/100,2,',','.') + ' Lei</div>'+
						'<div class="order-middle">' + $.number(item.Quantity,3,',','.') + ' <span class>MWh</span></div>'+
						'<div class="order-price"><span class="muted">Total tranzactie</span><br/>' + $.number(total,0,',','.') + ' Lei</div>'+
					'</div>';
			html += '<div class="clearfix"></div>'+
				'</div>'+
			'</div>';
			$order.addClass('closed');
			$order.find('.tile-body').html(html);
			$('#suborders-'+id).remove();
			$order.effect('highlight',5000,function(){ 
				$order.fadeOut().remove(); 
			});
		});
		$order.find('.tile-body .order-details').removeClass('multiple').addClass('order-control').html('<div class="order-price"><span class="muted">Pret mediu</span><br/>' + $.number(item.Price,2,',','.') + ' Lei</div>'+
			'<div class="order-middle">' + $.number(item.Quantity,3,',','.') + ' MWh</div>'+
			'<div class="order-price"><span class="muted">Total tranzactie</span><br/>' + $.number(item.Price*item.Quantity,0,',','.')+ ' Lei</div>'+
		'');
		$order.find('.tile-body').append('<div class="clearfix"></div>');
	}
	arrangeOrders();
}

function closeMarketOrder(id) {
	var $order = $('#market-order-'+id);
	if(!$order.hasClass('closed')) {
		$order.addClass('closed');
		//$order.find('.col-status').html('<span class="status-label">inchis</span>');
		$order.effect('highlight',2000,function(){ 
			$order.fadeOut(); 
		});
	}
	arrangeMarketOrders();
}

function processOrder(item) {
	if(searchIdInArray(item.ID,orders)==-1) {
		log('processing new order');
		// new order
		if(!item.isActive) return false;
		if(item.isTransacted) return false;
		orders.push(item);
		if(item.ID_Broker == b_id) appendOrder(item);
		if(whitelist.indexOf(item.ID_Client)>-1 || item.ID_Broker == b_id || $("#market-orders-container").attr('data-allow-add') == 0) appendMarketOrder(item);
		else log('blacklisted user order');
	}
	else {
		//existing order
		log('processing existing order');
		var oldOrder = orders[searchIdInArray(item.ID,orders)];
		if(oldOrder.isActive && item.isTransacted) {
			//close order
			if(item.ID_Broker == b_id) closeOrder(item.ID);
			closeMarketOrder(item.ID);
		}
		else if(item.isActive) {
			// change order
			orders[searchIdInArray(item.ID,orders)] = item;
			if(item.ID_Broker == b_id) appendOrder(item);
			if(whitelist.indexOf(item.ID_Client)>-1 || item.ID_Broker == b_id || $("#market-orders-container").attr('data-allow-add') == 0) appendMarketOrder(item);
			else log('blacklisted user order');
		}
		else {
			deleteOrder(item.ID);
		}
	}
}
function deleteOrder(ID) {
	if(searchIdInArray(ID,orders)==-1) {
		return false;
	}
	else {
		$('#suborders-'+ID).remove();
		$('#order-'+ID).fadeOut().remove(); 
		$('#market-order-'+ID).fadeOut().remove(); 
		var idx = searchIdInArray(ID,orders);
		orders.splice(idx,1);
	}
}

function arrangeOrders() {
	var $ordersList = $("#orders-list");
	if($ordersList.children('.order').length==0) {
		// nici un ordin disponibil
		//$ordersList.html('<div class="tiles white m-b-10 empty-message"><div class="tiles-body text-center">Nu exista ordine active.</div></div>');
		$("#orders-title").html('Nu exista ordine active');
	}
	else {
		// remove empty message
		//$ordersList.find('.empty-message').remove();
		$("#orders-title").html('Ordinele mele');
	}
}

function arrangeMarketOrders() {
	var $marketOrdersList = $("#market-orders-list");
	var $scroller = $(".market-order-scroller");
	if($marketOrdersList.children('.market-order').length==0) {
		// nici un ordin disponibil
		$marketOrdersList.html('<li class="empty-message"><div class="text-center padding-10">Nu exista ordine disponibile in piata.</div></li>');
		// clear slider
		$scroller.parent().replaceWith($scroller); 
	}
	else {
		// remove empty message
		$marketOrdersList.find('.empty-message').remove();
		// reconstruct slider
		if($scroller.height()>$scroller.attr("data-height")) {
			$scroller.slimScroll({
				size: '9px',
				color: '#BFBFBF',
				height: $scroller.attr("data-height"),
				railVisible: true,
				railColor: '#F2F2F2',
				opacity: 1,
				railOpacity: 1,
				alwaysVisible: true,
				disableFadeOut: true
			});
			$scroller.slimScroll({ scrollTo: $marketOrdersList.outerHeight(true)+'px' });
		}
	}
}

function appendOrder(item) {
	if($("#orders-container").length>0) {
		if(($("#order-"+item.ID).length>0 && !$("#order-"+item.ID).hasClass('closed')) || $("#order-"+item.ID).length==0) {
		log(item);
			var d = new moment(item.Date);
			var html = '<div class="tile m-b-10 order collapsed ' + (item.Direction=='S'?'sell':'buy') + '-order" id="order-' + item.ID + '" data-id="' + item.ID + '" '+(item.isSuspended?'style="opacity:0.5"':'')+'>'+
				'<div class="order-no">#' + item.ID + '</div>'+
				'<div class="order-label">' + (item.Direction=='S'?'VAND':'CUMPAR') + '</div>'+
				'<div class="tile-title">'+
					'<div class="controller">'+
						'<a href="" class="collapse pull-right m-l-10" rel="#suborders-' + item.ID + '">&nbsp;</a>'+
						( $("#orders-container").attr('data-allow-cancel') ? '<a class="btn btn-white btn-small pull-right cancel-order-button m-l-10" data-value="' + item.ID + '" href="/orders/cancel/' + item.ID + '" title="Anuleaza"><i class="fa fa-trash-o"></i></a>' : '')+
						( $("#orders-container").attr('data-allow-edit') ? '<a class="btn btn-white btn-small pull-right edit-order-button" data-value="' + item.ID + '" href="/orders/edit/' + item.ID + '" title="Modifica"><i class="fa fa-edit"></i></a>' : '')+
					'</div>'+
					'<div class="order-header">'+
						'<div class="order-quantity pull-left">' + $.number(item.Quantity,3,',','.') + ' <span class="muted">MWh</span></div>'+
						'<div class="separator pull-left"></div>'+
						'<div class="order-price pull-left">' + $.number(item.Price,2,',','.') + ' <span class="muted">Lei</span></div>'+
						'<div class="separator pull-left"></div>'+
						'<div class="order-period pull-left">' + moment(item.StartDeliveryDate).format('DD MMM') + ' - ' + moment(item.EndDeliveryDate).format('DD MMM') + '</div>'+
					'</div>'+
				'</div>'+
				'<div class="tile-body" style="display:none">'+
					'<div class="order-details multiple">Netranzactionat</div>'+
				'</div>'+
			'</div>';
			var html2 = '<div class="suborders" id="suborders-' + item.ID + '" style="display:none"></div>';
			if($("#order-"+item.ID).length>0) {
				$("#order-"+item.ID).replaceWith(html);
			}
			else $("#orders-list").append(html+html2);
			socket.get('/orders/matches', {id:item.ID}, function(matches) {
				//log(matches);
				var $parent = $("#order-"+item.ID);
				//$list.html('');
				//if(orders[searchIdInArray(item.ID,orders)].hasOwnProperty('matches') && JSON.stringify(matches) == JSON.stringify(orders[searchIdInArray(item.ID,orders)].matches)) return false;
				//else {
					orders[searchIdInArray(item.ID,orders)].matches = matches;
					if(matches.length>0) {
						var combination,combinations={};
						for (var i=0;i<matches.length;i++) {
							if(!combinations.hasOwnProperty(matches[i].ID)) combinations[matches[i].ID] = [];
							combinations[matches[i].ID].push(matches[i]);
						}
						//log(combinations);
						$("#suborders-"+item.ID).html('');
						if(Object.keys(combinations).length>0) $parent.find(".order-details").html('Netranzactionat dar ai '+Object.keys(combinations).length+(Object.keys(combinations).length==1?' varianta posibila':' variante posibile'));
						for (var i=0;i<Object.keys(combinations).length;i++) {
							combination = combinations[Object.keys(combinations)[i]];
							appendNewCombination(combination,item,i);
						}
						// animate order
						$order = $("#order-"+item.ID);
						if($order.hasClass("collapsed")) {
							$order.find(".tile-body").show();
							$("#suborders-"+item.ID).show();
							$order.removeClass("collapsed");
						}
						$order.effect('highlight',2000);
					}
					else {
						$("#suborders-"+item.ID).html('').hide();
					}
				//}
			});
			arrangeOrders();
		}
	}
}

function appendNewCombination(combination,item, index) {
	var d = new moment(item.Date);
	log(combination);
	var html = '<div class="tile suborder ' + (item.Direction=='S'?'sell':'buy') + '-order" id="combination-' + combination[0].ID + '" rel="' + item.ID + '">'+
		'<div class="tile-body">';
	html += '<div class="order-sections">';
	var mean = 0,total = 0, totalQuantity = 0;
	var i1 = new moment(item.StartDeliveryDate);
	var i2 = new moment(item.EndDeliveryDate);
	var interval = i2.diff(i1,'days');
	log('interval:'+interval);
	for(var i=0;i<combination.length;i++) {
		mean += combination[i].Quantity*combination[i].Price;
		totalQuantity += combination[i].Quantity;
		total += combination[i].Quantity*combination[i].Price;
		var c1 = new moment(combination[i].StartDeliveryDate);
		var c2 = new moment(combination[i].EndDeliveryDate);
		var segment = c2.diff(c1,'days');
		html += '<div class="section section' + (i+1) + ((segment/interval*350)<100?' narrowed':'') + '" style="width:' + (segment*100/interval) + '%"><div class="inner-section">'+
					'<div class="order-price"><strong>' + $.number(combination[i].Price,2,',','.') + ' Lei</strong><br/>per MWh</div>'+
					'<div class="order-quantity">' + $.number(combination[i].Quantity,3,',','.') + ' MWh</div>';
		if(segment==1) html += '<div class="order-date text-center">' + c1.format('DD MMM') + '</div>';
		else html += '<div class="order-date"><div class="pull-right text-right p-r-5">' + c2.format('DD MMM') + '</div><div class="text-left pull-left p-l-5">' + c1.format('DD MMM') + '</div></div>';
		html += '</div><div class="mock"><div class="order-price">&nbsp;<br/>&nbsp;</div><div class="order-quantity">&nbsp;</div><div class="order-date">&nbsp;</div></div></div>';
	}
	mean = mean/totalQuantity;
	html += '</div>';
	html += '<div class="order-control">'+
				'<div class="order-price"><span class="muted">Pret mediu</span><br/>' + $.number(Math.round(mean*100)/100,2,',','.') + ' Lei</div>'+
				'<div class="order-middle"><a class="accept-order ' + (combination.length==1?'change-order':'') + ' btn btn-primary btn-small" rel="' + combination[0].ID + '">' + (combination.length==1?'Modifica':'Accepta') + '</a></div>'+
				'<div class="order-price"><span class="muted">Total tranzactie</span><br/>' + total + ' Lei</div>'+
			'</div>';
	html += '<div class="clearfix"></div>'+
		'</div>'+
	'</div>';
	$("#suborders-"+item.ID).append(html);
}

function sortMarketOrdersList() {
	if($(".market-order-list").length>0) {
		var $list = $(".market-order-list");
		$(".market-order-col-header:not(.col-action)").click(function(e) {
			if($(this).hasClass('sort_asc')) {
				var sort_order = 'desc';
				$(".market-order-col-header").removeClass('sort_desc').removeClass('sort_asc');
				$(this).addClass('sort_desc');
			}
			else {
				var sort_order = 'asc';
				$(".market-order-col-header").removeClass('sort_desc').removeClass('sort_asc');
				$(this).addClass('sort_asc');
			}
			var col = $(this).attr('data-col');
			$(".market-order-list>li").tsort('.'+col+'',{attr:'data-value',order:sort_order});
			e.preventDefault();
		});
		$(".market-order-col-header:not(.col-action)").each(function(idx) {
			if($(this).hasClass('sort_asc')) {
				var sort_order = 'desc';
				$(".market-order-col-header").removeClass('sort_desc').removeClass('sort_asc');
				$(this).addClass('sort_desc');
				var col = $(this).attr('data-col');
				$(".market-order-list>li").tsort('.'+col+'',{attr:'data-value',order:sort_order});
			}
			else if($(this).hasClass('sort_desc')) {
				var sort_order = 'asc';
				$(".market-order-col-header").removeClass('sort_desc').removeClass('sort_asc');
				$(this).addClass('sort_asc');
				var col = $(this).attr('data-col');
				$(".market-order-list>li").tsort('.'+col+'',{attr:'data-value',order:sort_order});
			}
		});
	}
}

function updateRingSessionStats() {
	socket.get('/home/stats', {}, function(data) {
		if(data.success) {
			var stats = data.data;
			$("#session-status").html(getRingStatus(stats.Status));
			$("#session-stats").html('<tbody>'+
					'<tr>'+
						'<td>'+
							'<div class="stats-value">' + $.number(stats.OpeningPrice,2,',','.') +'</div>'+
							'<div class="stats-unit">Lei/MWh</div>'+
						'</td>'+
						'<td class="v-align-top">'+
							'<div class="stats-label pull-left">pret<br/>deschidere</div>'+
						'</td>'+
						'<td>'+
							'<div class="stats-value">' + (stats.TotalVolume>1000000000?$.number(stats.TotalVolume/1000000000,2,',','.')+' mld':$.number(stats.TotalVolume,0,',','.')) + '</div>'+
							'<div class="stats-unit">MWh</div>'+
						'</td>'+
						'<td class="v-align-top">'+
							'<div class="stats-label pull-left">Volum total<br/>tranzactionat</div>'+
						'</td>'+
						'<td>'+
							'<div class="stats-value">' + stats.TransactionsCount + '</div>'+
							'<div class="stats-unit"></div>'+
						'</td>'+
						'<td class="v-align-top">'+
							'<div class="stats-label pull-left">tranzactii<br/>incheiate</div>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+
							'<div class="stats-value">' + $.number(stats.ClosingPrice,2,',','.') + '</div>'+
							'<div class="stats-unit">Lei/MWh</div>'+
						'</td>'+
						'<td class="v-align-top">'+
							'<div class="stats-label pull-left">ultimul<br/>pret</div>'+
						'</td>'+
						'<td>'+
							'<div class="stats-value">' + (stats.TotalValue>1000000000?$.number(stats.TotalValue/1000000000,2,',','.')+' mld':$.number(stats.TotalValue,0,',','.')) + '</div>'+
							'<div class="stats-unit">Lei</div>'+
						'</td>'+
						'<td class="v-align-top">'+
							'<div class="stats-label pull-left">Valoare totala<br/>tranzactionata</div>'+
						'</td>'+
						'<td>'+
							'<div class="stats-value">' + stats.OrdersCount + '</div>'+
							'<div class="stats-unit"></div>'+
						'</td>'+
						'<td class="v-align-top">'+
							'<div class="stats-label pull-left">ordine<br/>active</div>'+
						'</td>'+
					'</tr>'+
				'</tbody>');
		}
	});
}

function updateMessageCount() {
	var count = $("#my-task-list").attr('data-count');
	$("#my-task-list .username .badge").html(count);
	if(count==0) $("#my-task-list .username .badge").removeClass('badge-important');
	else $("#my-task-list .username .badge").addClass('badge-important');
}

function showErrors(error) {
	fancyAlert(error);
}

function showRelogin(msg) {
	fancyAlert(msg, function() {
		window.location.href = '/login';
	});
}
