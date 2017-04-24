var reasons = [];

$(document).ready(function() {		
	calculateHeight();
	
	$("[data-toggle='popover']").popover();
	/*
	$('#my-task-list').popover({
		html:true			
	})*/
	$('.numeric').autoNumeric('init');

	//$.fn.datepicker.defaults.format = "dd M yyyy";
	$('.datepicker').datepicker({
		dateFormat:'dd M yyyy',
		autoclose:true,
		orientation:'auto top'
	});
	
	$(".fancybox").fancybox({
		padding: 0,
		autoWidth: true,
		autoHeight: true,
		fitToView: true
	});
	if($("#ID_GNType").length>0) $("#ID_GNType").select2({minimumResultsForSearch: -1, width:'100%'});
	if($("#ReportType").length>0) $("#ReportType").select2({minimumResultsForSearch: -1, width:'100%'});
	$(".select2").each(function(idx){
		$elm = $(this);
		if(typeof $elm.attr('data-placeholder') != 'undefined') $elm.select2({
			allowClear: true,
			placeholder: 'select something'
		});
		else $elm.select2();
	});
	
	if($('#report_StartDate').length>0 && $('#report_EndDate').length>0) {
		var startDate = new Date();
		$('#report_StartDate').datepicker({
			dateFormat:'yyyy-mm-dd',
			endDate: startDate,
			autoclose:true,
			orientation:'auto top'
		}).on('changeDate', function(selected){
			startDate = new Date(selected.date.valueOf());
			startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
			$('#prm_EndDate').datepicker('setStartDate', startDate);
		});
		$('#report_EndDate').datepicker({
			dateFormat:'yyyy-mm-dd',
			startDate: new Date(),
			autoclose: true,
			orientation:'auto top'
		}).on('changeDate', function(selected){
			endDate = new Date(selected.date.valueOf());
			endDate.setDate(endDate.getDate(new Date(selected.date.valueOf())));
			$('#prm_StartDate').datepicker('setEndDate', endDate);
		});
	}

	$(".tile-toggle").click(function(e){
		$this = $(this);
		if($this.parent().parent().parent().hasClass('collapsed')) {
			$this.parent().parent().parent().removeClass('collapsed');
			$this.parent().parent().parent().find('.tile-body').show();
		}
		else {
			$this.parent().parent().parent().addClass('collapsed');
			$this.parent().parent().parent().find('.tile-body').hide();
		}
		e.preventDefault();
	});
	$(".toggle").click(function(e){
		$this = $(this);
		if($this.attr('data-toggle') && $($this.attr('data-toggle')).length>0) {
			if($this.parent().parent().hasClass('collapsed')) {
				$this.parent().parent().removeClass('collapsed');
				$($this.attr('data-toggle')).show();
				//$this.find('.tile-body').show();
			}
			else {
				$this.parent().parent().addClass('collapsed');
				$($this.attr('data-toggle')).hide();
			}
		}
		e.preventDefault();
	});

	$(".extract").click(function(e){
		e.preventDefault();
		$this = $(this);
		$tile = $this.closest('.tile');
		if($tile.hasClass('flyout')) {
			$tile.removeClass('flyout');
			$this.attr('title','Deschide in popup');
			$this.find('i').addClass('fa-external-link');
			$this.find('i').removeClass('fa-external-link-square');
		}
		else {
			$tile.addClass('flyout');
			$this.attr('title','Ataseaza la grid');
			$this.find('i').addClass('fa-external-link-square');
			$this.find('i').removeClass('fa-external-link');
		}
	});

	/*********** forms ******************/
	
	$('#user-form').submit(function(e){
		var ok = true;
		$('#user-form').find(".error").remove();
		$('#user-form').find(".required").each(function(elm){
			if($.trim($(this).val())=='') {
				$('<span class="error">This field is required.</span>').insertAfter($(this));
				ok = false;
			}
			if(ok) {
				if($(this).hasClass('equalTo')) {
					if($(this).val()!=$($(this).attr('rel')).val()) {
						$('<span class="error">Passwords do not match.</span>').insertAfter($(this));
						ok = false;
					}
				}
			}
		});
		if(ok) {
			return true;
		}
		e.preventDefault();
	});	
	
function fancyBlacklist(callback) {
    var ret;
    var s;
	var html = '<div style="margin:1px;width:270px;" class="text-center">'+
					'<p>Introduceti motivul refuzului colaborarii cu acest partener.</p>'+
					'<div id="blacklist-form">'+
						'<select name="blacklist-reason" id="blacklist-reason" class="">';
	for(var i=0;i<reasons.length;i++) html += '<option value="'+reasons[i].ID+'">'+reasons[i].Reason+'</option>';
	html +='</select>'+
					'</div>'+
					'<div class="p-t-20">'+
						'<button class="btn btn-primary btn-cons" id="fancyConfirm_ok">Salveaza</button>&nbsp;'+
						'<button class="btn btn-cancel btn-cons" id="fancyConfirm_cancel">Renunta</button>'+
					'</div>'
    var modalFancybox = $.fancybox({
        modal : true,
        content : html,
        afterShow : function() {
			s = '';
            $("#blacklist-reason").keypress(function(event) {
				if (event.keyCode == 13) {
					$("#blacklist-form").find('.error').remove();
					if($.trim($("#blacklist-reason").val())=='') {
						$("#blacklist-form").append('<div class="error">Campul este obligatoriu.</div>');
					}
					else {
						ret = true; 
						s = $("#blacklist-reason").val();
						$.fancybox.close();
					}
				}
			});
            $("#fancyConfirm_cancel").click(function() {
                ret = false; 
                $.fancybox.close();
            });
            $("#fancyConfirm_ok").click(function() {
				$("#blacklist-form").find('.error').remove();
				if($.trim($("#blacklist-reason").val())=='') {
					$("#blacklist-form").append('<div class="error">Campul este obligatoriu.</div>');
				}
				else {
					ret = true; 
					s = $("#blacklist-reason").val();
					$.fancybox.close();
				}
            })
        },
        afterClose : function() {
            callback.call(this,ret,s);
        }
    });
}

	$(".whitelist-input").change(function(e){
		var $this = $(this);
		log($(".whitelist-input:checked").length);
		if($(".whitelist-input:checked").length<4) {
			fancyAlert('Pentru a putea tranzactiona este nevoie de minim 4 parteneri!');
			if(!$this.is(':checked')) $this.attr('checked',true);
			e.preventDefault();
			return;
		}
		$this.parent().find('label').append('<i class="processing fa fa-spinner fa-spin"></i>');
		if($this.is(':checked')) {
			$.post('/account/whitelistSave',{id:$this.attr('data-id'), checked:$this.is(':checked')},function(data,textStatus){
				console.log(data);
				if(!data.Success) {
					var msg = '';
					if(data.ResultType=='JSONKeyValuePairStruct') {
						for(var i in data.Result) {
							if(data.Result[i]!='') {
								msg += '<span class="error">'+data.Result[i]+'</span>';
							}
						}
					}
					else if(data.ResultType=='GeneralError' || data.ResultType=='String') {
						msg = data.Result;
					}
					$this.parent().parent().find('.processing').remove();
					$this.parent().parent().append('<i class="processing processing-bad fa fa-exclamation-triangle"></i>');
					fancyAlert(msg);
				}
				else if(data.Success) {
					$this.parent().parent().find('.processing').remove();
					$this.parent().parent().append('<i class="processing processing-ok fa fa-check"></i>');
					$this.parent().parent().find('.blacklist-reason').html('');
				}
				$this.parent().parent().find('.processing').fadeOut(1000,function(){ $(this).remove(); });
			});
		}
		else {
			$.post('/account/whitelistSave',{id:$this.attr('data-id'), checked:$this.is(':checked')},function(data,textStatus){
				if(!data.Success) {
					var msg = '';
					if(data.ResultType=='JSONKeyValuePairStruct') {
						for(var i in data.Result) {
							if(data.Result[i]!='') {
								msg += '<span class="error">'+data.Result[i]+'</span>';
							}
						}
					}
					else if(data.ResultType=='GeneralError' || data.ResultType=='String') {
						msg = data.Result;
					}
					$this.parent().parent().find('.processing').remove();
					$this.parent().parent().append('<i class="processing processing-bad fa fa-exclamation-triangle"></i>');
					fancyAlert(msg);
				}
				else if(data.Success) {
					$this.parent().parent().find('.processing').remove();
					$this.parent().parent().append('<i class="processing processing-ok fa fa-check"></i>');
					//var reason = reasons[searchIdInArray(s,reasons)];
					//$this.parent().parent().find('.blacklist-reason').html('('+reason.Reason+' - <span class="bold">Neaprobat</span>'+')');
					fancySuccess('Cererea a fost salvata cu succes!');
				}
				$this.parent().parent().find('.processing').fadeOut(1000,function(){ $(this).remove(); });
			});
			/*
			socket.get('/account/whitelist-reasons', {}, function(response) {
				if(response.Success) {
					reasons = response.Result;
			
					fancyBlacklist(function(ret,s){
						if(ret) {
							$.post('/account/whitelistSave',{id:$this.attr('data-id'), checked:$this.is(':checked'), reason: s},function(data,textStatus){
								if(!data.Success) {
									var msg = '';
									if(data.ResultType=='JSONKeyValuePairStruct') {
										for(var i in data.Result) {
											if(data.Result[i]!='') {
												msg += '<span class="error">'+data.Result[i]+'</span>';
											}
										}
									}
									else if(data.ResultType=='GeneralError' || data.ResultType=='String') {
										msg = data.Result;
									}
									$this.parent().parent().find('.processing').remove();
									$this.parent().parent().append('<i class="processing processing-bad fa fa-exclamation-triangle"></i>');
									fancyAlert(msg);
								}
								else if(data.Success) {
									$this.parent().parent().find('.processing').remove();
									$this.parent().parent().append('<i class="processing processing-ok fa fa-check"></i>');
									var reason = reasons[searchIdInArray(s,reasons)];
									$this.parent().parent().find('.blacklist-reason').html('('+reason.Reason+' - <span class="bold">Neaprobat</span>'+')');
								}
								$this.parent().parent().find('.processing').fadeOut(1000,function(){ $(this).remove(); });
							});
						}
						else {
							$this.parent().find('.processing').remove();
							$this.attr('checked',true);
							e.preventDefault();
						}
					});
				}
				else {
					fancyAlert('Nu s-a putut verifica lista de motive de debifare! Va rugam sa mai incercati o data.');
				}
			});
			*/
		}
	});
	
	$(".entrypoint-input").change(function(e){
		var $this = $(this);
		log($(".entrypoint-input:checked").length);
		$this.parent().find('label').append('<i class="processing fa fa-spinner fa-spin"></i>');
		$.post('/account/entrypointSave',{id:$this.attr('data-id'), checked:$this.is(':checked')},function(data,textStatus){
			if(!data.Success) {
				var msg = '';
				if(data.ResultType=='JSONKeyValuePairStruct') {
					for(var i in data.Result) {
						if(data.Result[i]!='') {
							msg += '<span class="error">'+data.Result[i]+'</span>';
						}
					}
				}
				else if(data.ResultType=='GeneralError' || data.ResultType=='String') {
					msg = data.Result;
				}
				$this.parent().parent().find('.processing').remove();
				$this.parent().parent().append('<i class="processing processing-bad fa fa-exclamation-triangle"></i>');
				fancyAlert(msg);
			}
			else if(data.Success) {
				$this.parent().parent().find('.processing').remove();
				$this.parent().parent().append('<i class="processing processing-ok fa fa-check"></i>');
			}
			$this.parent().parent().find('.processing').fadeOut(1000,function(){ $(this).remove(); });
		});
	});
	
		$('#reports-form').submit(function(e){
			var ok = true;
			var $form = $(this);
			$form.find(".error").remove();
			$form.find(".required").each(function(elm){
				if($.trim($(this).val())=='') {
					$('<span class="error">Campul este obligatoriu.</span>').insertAfter($(this).parent());
					ok = false;
				}
			});
			if(ok) return true;
			e.preventDefault();
		});	
		
	/*************** forms ****************/
	
	

	$(document).on('click','.tile .controller .collapse',function (e) { 
		var $el = $(this).parent().parent().parent();
		if($el.hasClass("collapsed")) {
			$el.find(".tile-body").show();
			if($(this).attr('rel')!='') $($(this).attr('rel')).show();
			$el.removeClass("collapsed");
		}
		else {
			$el.find(".tile-body").hide();
			if($(this).attr('rel')!='') $($(this).attr('rel')).hide();
			$el.addClass("collapsed");
		}
		e.preventDefault();
	});

	/*$('.dropdown-toggle').click(function () {
		$("img").trigger("unveil");
	});*/

	$(".remove-widget").click(function() {		
		$(this).parent().parent().parent().addClass('animated fadeOut');
		$(this).parent().parent().parent().attr('id', 'id_a');

		//$(this).parent().parent().parent().hide();
		 setTimeout( function(){			
			$('#id_a').remove();	
		 },400);	
	return false;
	});
	
	$(".create-folder").click(function() {
		$('.folder-input').show();
		return false;
	});
	
	$(".folder-name").keypress(function (e) {
        if(e.which == 13) {
			 $('.folder-input').hide();
			 $( '<li><a href="#"><div class="status-icon green"></div>'+  $(this).val() +'</a> </li>' ).insertBefore( ".folder-input" );
			 $(this).val('');
		}
    });
	
	$("#menu-collapse").click(function() {	
		if($('.page-sidebar').hasClass('mini')){
			$('.page-sidebar').removeClass('mini');
			$('.page-content').removeClass('condensed-layout');
			$('.footer-widget').show();
		}
		else{
			$('.page-sidebar').addClass('mini');
			$('.page-content').addClass('condensed-layout');
			$('.footer-widget').hide();
			calculateHeight();
		}
	});

	$(".inside").children('input').blur(function(){
		$(this).parent().children('.add-on').removeClass('input-focus');		
	})
	
	$(".inside").children('input').focus(function(){
		$(this).parent().children('.add-on').addClass('input-focus');		
	})	
	
	$(".input-group.transparent").children('input').blur(function(){
		$(this).parent().children('.input-group-addon').removeClass('input-focus');		
	})
	
	$(".input-group.transparent").children('input').focus(function(){
		$(this).parent().children('.input-group-addon').addClass('input-focus');		
	})	
	
	$(".bootstrap-tagsinput input").blur(function(){
		$(this).parent().removeClass('input-focus');
	})
	
	$(".bootstrap-tagsinput input").focus(function(){
		$(this).parent().addClass('input-focus');		
	})	
	
	$('#my-task-list').click(function(e) {
		if($('#notification-list').hasClass('visible')) {
			$('#notification-list').removeClass('visible').hide();
		}
		else {
			$('#notification-list').addClass('visible').show();
		}
		e.preventDefault();
    });

	$(document).mouseup(function (e) {
		var container = $("#notification-list");
		if (!container.is(e.target) // if the target of the click isn't the container...
			&& container.has(e.target).length === 0) // ... nor a descendant of the container
		{
			container.removeClass('visible').hide();
		}
	});	
	
	
	$(document).on('click','.first-alert',function(e) {
		if($('#alerts-popup').hasClass('visible')) {
			$('#alerts-popup').removeClass('visible').hide();
		}
		else {
			$('#alerts-popup').addClass('visible').show();
			//$(this).find('.badge').removeClass('badge-important').html('0');
		}
		e.preventDefault();
    });
	
	$(document).mouseup(function (e) {
		var container = $("#alerts-popup");
		if (!container.is(e.target) // if the target of the click isn't the container...
			&& container.has(e.target).length === 0) // ... nor a descendant of the container
		{
			container.removeClass('visible').hide();
		}
	});	
	/*
	$('#user-options').click(function(){
		$('#my-task-list').popover('hide')
	})*/
//*********************************** BEGIN CHAT POPUP*****************************
	/* $('.chat-menu-toggle').sidr({
		name:'sidr',
		side: 'right',
		complete:function(){		 
		}
	});*/
	$(".simple-chat-popup").click(function(){
		$(this).addClass('hide');
		$('#chat-message-count').addClass('hide');	
	});

	setTimeout( function(){
		$('#chat-message-count').removeClass('hide');	
		$('#chat-message-count').addClass('animated bounceIn');
		$('.simple-chat-popup').removeClass('hide');			
		$('.simple-chat-popup').addClass('animated fadeIn');		
	},5000);	
	setTimeout( function(){
		$('.simple-chat-popup').addClass('hide');			
		$('.simple-chat-popup').removeClass('animated fadeIn');		
		$('.simple-chat-popup').addClass('animated fadeOut');		
	},8000);
	
//*********************************** END CHAT POPUP*****************************	
	
//**********************************BEGIN MAIN MENU********************************
	jQuery('.page-sidebar li > a').on('click', function (e) {
            if ($(this).next().hasClass('sub-menu') == false) {
                return;
	}
     var parent = $(this).parent().parent();


            parent.children('li.open').children('a').children('.arrow').removeClass('open');
            parent.children('li.open').children('a').children('.arrow').removeClass('active');
            parent.children('li.open').children('.sub-menu').slideUp(200);
            parent.children('li').removeClass('open');
          //  parent.children('li').removeClass('active');
			
            var sub = jQuery(this).next();
            if (sub.is(":visible")) {
                jQuery('.arrow', jQuery(this)).removeClass("open");
                jQuery(this).parent().removeClass("active");
                sub.slideUp(200, function () {
                    handleSidenarAndContentHeight();
                });
            } else {
                jQuery('.arrow', jQuery(this)).addClass("open");
                jQuery(this).parent().addClass("open");
                sub.slideDown(200, function () {
                    handleSidenarAndContentHeight();
                });
            }

            e.preventDefault();
        });
	//Auto close open menus in Condensed menu
		if( $('.page-sidebar').hasClass('mini'))  {			
			var elem = jQuery('.page-sidebar ul');
		    elem.children('li.open').children('a').children('.arrow').removeClass('open');
            elem.children('li.open').children('a').children('.arrow').removeClass('active');
            elem.children('li.open').children('.sub-menu').slideUp(200);
            elem.children('li').removeClass('open');
		}
//**********************************END MAIN MENU********************************
//**** Element Background and height ********************************************

	$('[data-height-adjust="true"]').each(function(){
		var h = $(this).attr('data-elem-height');
		$(this).css("min-height", h);
		$(this).css('background-image', 'url(' + $(this).attr("data-background-image") + ')');
		$(this).css('background-repeat', 'no-repeat');
		if($(this).attr('data-background-image')){		
		
		}	
	})
	function equalHeight(group) {
	   tallest = 0;
	   group.each(function() {
		  thisHeight = $(this).height();
		  if(thisHeight > tallest) {
			 tallest = thisHeight;
		  }
	   });
	   group.height(tallest);
	}

	$('[data-aspect-ratio="true"]').each(function(){
		$(this).height($(this).width());
	})

	$('[data-sync-height="true"]').each(function(){
		equalHeight($(this).children());
	});	

	$( window ).resize(function() {	
		$('[data-aspect-ratio="true"]').each(function(){
			$(this).height($(this).width());
		})
		$('[data-sync-height="true"]').each(function(){
			equalHeight($(this).children());
		});	
	});

//***********************************BEGIN Fixed Menu*****************************
	/*var eleHeight =window.screen.height;
	eleHeight=eleHeight-(eleHeight*22.5/100);
	if( !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))  ) {
		$('#main-menu-wrapper').slimScroll({
			color: '#a1b2bd',
			size: '4px',
			height: eleHeight,
			alwaysVisible: false
		});
	}
	*/
//***********************************BEGIN Lazyload images*****************************	
 if ($.fn.lazyload){	
	$("img.lazy").lazyload({
		effect : "fadeIn"
	});
}
//***********************************BEGIN Grids*****************************		
		 $('.grid .tools a.remove').on('click', function () {
            var removable = jQuery(this).parents(".grid");
            if (removable.next().hasClass('grid') || removable.prev().hasClass('grid')) {
                jQuery(this).parents(".grid").remove();
            } else {
                jQuery(this).parents(".grid").parent().remove();
            }
        });

        $('.grid .tools a.reload').on('click', function () {
            var el =  jQuery(this).parents(".grid");
            blockUI(el);
			window.setTimeout(function () {
               unblockUI(el);
            }, 1000);
        });
		
		$('.grid .tools .collapse, .grid .tools .expand').on('click', function () {
            var el = jQuery(this).parents(".grid").children(".grid-body");
            if (jQuery(this).hasClass("collapse")) {
                jQuery(this).removeClass("collapse").addClass("expand");
                el.slideUp(200);
            } else {
                jQuery(this).removeClass("expand").addClass("collapse");
                el.slideDown(200);
            }
        });		
		
		$('.user-info .collapse').on('click', function () {
            jQuery(this).parents(".user-info ").slideToggle();
		});   
//***********************************END Grids*****************************				
		var handleSidenarAndContentHeight = function () {
        var content = $('.page-content');
        var sidebar = $('.page-sidebar');

        if (!content.attr("data-height")) {
            content.attr("data-height", content.height());
        }

        if (sidebar.height() > content.height()) {
            content.css("min-height", sidebar.height() + 120);
        } else {
            content.css("min-height", content.attr("data-height"));
        }
    }
	$('.panel-group').on('hidden.bs.collapse', function (e) {
	  $(this).find('.panel-heading').not($(e.target)).addClass('collapsed');
	})
	
	$('.panel-group').on('shown.bs.collapse', function (e) {
	 // $(e.target).prev('.accordion-heading').find('.accordion-toggle').removeClass('collapsed');
	})

//***********************************BEGIN Layout Readjust *****************************		

/*
	$(window).setBreakpoints({
		distinct: true, 
		breakpoints: [
			320,
			480,
			768,
			1024
		] 
	});   	
	//Break point entry 
	$(window).bind('enterBreakpoint320',function() {	
		$('#main-menu-toggle-wrapper').show();		
		$('#portrait-chat-toggler').show();	
		$('#header_inbox_bar').hide();	
		$('#main-menu').removeClass('mini');		   
		$('.page-content').removeClass('condensed');
		rebuildSider();
	});	
	
	$(window).bind('enterBreakpoint480',function() {
		$('#main-menu-toggle-wrapper').show();		
		$('.header-seperation').show();		
		$('#portrait-chat-toggler').show();				
		$('#header_inbox_bar').hide();	
		//Incase if condensed layout is applied
		$('#main-menu').removeClass('mini');		   
		$('.page-content').removeClass('condensed');			
		rebuildSider();
	});
	
	$(window).bind('enterBreakpoint800',function() {		
		$('#main-menu-toggle-wrapper').show();		
		$('#portrait-chat-toggler').show();			
		$('#header_inbox_bar').hide();	
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {			
			$('#main-menu').removeClass('mini');	
			$('.page-content').removeClass('condensed');	
			rebuildSider();
		}	
		
	});
	$(window).bind('enterBreakpoint1024',function() {	
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {			
			var elem = jQuery('.page-sidebar ul');
		    elem.children('li.open').children('a').children('.arrow').removeClass('open');
            elem.children('li.open').children('a').children('.arrow').removeClass('active');
            elem.children('li.open').children('.sub-menu').slideUp(200);
            elem.children('li').removeClass('open');
		}
	});
	
	$(window).bind('exitBreakpoint320',function() {	
		$('#main-menu-toggle-wrapper').hide();		
		$('#portrait-chat-toggler').hide();	
		$('#header_inbox_bar').show();			
		closeAndRestSider();		
	});	
	
	$(window).bind('exitBreakpoint480',function() {
		$('#main-menu-toggle-wrapper').hide();		
		$('#portrait-chat-toggler').hide();	
		$('#header_inbox_bar').show();			
		closeAndRestSider();	
	});
	
	$(window).bind('exitBreakpoint768',function() {
		$('#main-menu-toggle-wrapper').hide();		
		$('#portrait-chat-toggler').hide();	
		$('#header_inbox_bar').show();			
		closeAndRestSider();
	});
	*/
//***********************************END Layout Readjust *****************************	

//***********************************BEGIN Function calls *****************************	
	/*function closeAndRestSider(){
	  if($('#main-menu').attr('data-inner-menu')=='1'){
		$('#main-menu').addClass("mini");	
		$.sidr('close', 'main-menu');
		$.sidr('close', 'sidr');		
		$('#main-menu').removeClass("sidr");	
		$('#main-menu').removeClass("left");	
	  }
	  else{
		$.sidr('close', 'main-menu');
		$.sidr('close', 'sidr');		
		$('#main-menu').removeClass("sidr");	
		$('#main-menu').removeClass("left");
	}
	
	}
	function rebuildSider(){
		$('#main-menu-toggle').sidr({		
				name : 'main-menu',
				side: 'left'
		});
	}
	*/
//***********************************END Function calls *****************************	

//***********************************BEGIN Main Menu Toggle *****************************	
	$('#layout-condensed-toggle').click(function(){
        $.sidr('close', 'sidr');
        if($('#main-menu').attr('data-inner-menu')=='1'){
            //Do nothing
            console.log("Menu is already condensed");
        }
        else{
            if($('#main-menu').hasClass('mini')){
				$('body').removeClass('grey');
                $('#main-menu').removeClass('mini');
                $('.page-content').removeClass('condensed');
                $('.scrollup').removeClass('to-edge');
                $('.header-seperation').show();
                //Bug fix - In high resolution screen it leaves a white margin
                $('.header-seperation').css('height','61px');
                $('.footer-widget').show();
            }
            else{
                $('body').addClass('grey');
                $('#main-menu').addClass('mini');
                $('.page-content').addClass('condensed');
                $('.scrollup').addClass('to-edge');
                $('.header-seperation').hide();
                $('.footer-widget').hide();
            }
        }
	});
//***********************************END Main Menu Toggle *****************************	
	
//***********************************BEGIN Slimscroller *****************************		
	$('.scroller').each(function () {
		//if($(this).height()>$(this).attr("data-height")) {
			$(this).slimScroll({
					size: '9px',
					color: '#BFBFBF',
					height: $(this).attr("data-height"),
					railVisible: true,
					railColor: '#F2F2F2',
					opacity: 1,
					railOpacity: 1,
					alwaysVisible: true,
					disableFadeOut: true
			});
		//}
    });
//***********************************END Slimscroller *****************************	

//***********************************BEGIN dropdow menu *****************************		
	/*$('.dropdown-toggle').click(function () {
		$("img").trigger("unveil");
	});*/
//***********************************END dropdow menu *****************************	

//***********************************BEGIN Global sparkline chart  *****************************	   
	if ($.fn.sparkline) {
		$('.sparklines').sparkline('html', { enableTagOptions: true });
	}
//***********************************END Global sparkline chart  *****************************	

//***********************************BEGIN Function calls *****************************	
	 $('table th .checkall').on('click', function () {
			if($(this).is(':checked')){
				$(this).closest('table').find(':checkbox').attr('checked', true);
				$(this).closest('table').find('tr').addClass('row_selected');
				//$(this).parent().parent().parent().toggleClass('row_selected');	
			}
			else{
				$(this).closest('table').find(':checkbox').attr('checked', false);
				$(this).closest('table').find('tr').removeClass('row_selected');
			}
    });
//***********************************BEGIN Function calls *****************************	

//***********************************BEGIN Function calls *****************************	
	$('.animate-number').each(function(){
		 $(this).animateNumbers($(this).attr("data-value"), true, parseInt($(this).attr("data-animation-duration")));	
	})
	$('.animate-progress-bar').each(function(){
		 $(this).css('width', $(this).attr("data-percentage"));
		
	})
//***********************************BEGIN Function calls *****************************	

//***********************************BEGIN Tiles Controller Options *****************************		
	

	$('.widget-item > .controller .reload').click(function () { 
		var el =$(this).parent().parent();
		blockUI(el);
		  window.setTimeout(function () {
               unblockUI(el);
            }, 1000);
	});
	$('.widget-item > .controller .remove').click(function () {
		$(this).parent().parent().parent().addClass('animated fadeOut');
		$(this).parent().parent().parent().attr('id', 'id_remove_temp_id');
		 setTimeout( function(){			
			$('#id_remove_temp_id').remove();	
		 },400);
	});
	
	$('.tiles .controller .reload').click(function () { 
		var el =$(this).parent().parent().parent();
		blockUI(el);
		  window.setTimeout(function () {
               unblockUI(el);
            }, 1000);
	});
	$('.tiles .controller .remove').click(function () {
		$(this).parent().parent().parent().parent().addClass('animated fadeOut');
		$(this).parent().parent().parent().parent().attr('id', 'id_remove_temp_id');
		 setTimeout( function(){			
			$('#id_remove_temp_id').remove();	
		 },400);
	});
        if (!jQuery().sortable) {
            return;
        }
        $(".sortable").sortable({
            connectWith: '.sortable',
            iframeFix: false,
            items: 'div.grid',
            opacity: 0.8,
            helper: 'original',
            revert: true,
            forceHelperSize: true,
            placeholder: 'sortable-box-placeholder round-all',
            forcePlaceholderSize: true,
            tolerance: 'pointer'
        });
//***********************************BEGIN Function calls *****************************	

//***********************************BEGIN Function calls *****************************	
    function blockUI(el) {		
            $(el).block({
                message: '<div class="loading-animator"></div>',
                css: {
                    border: 'none',
                    padding: '2px',
                    backgroundColor: 'none'
                },
                overlayCSS: {
                    backgroundColor: '#fff',
                    opacity: 0.3,
                    cursor: 'wait'
                }
            });
     }
	 
     // wrapper function to  un-block element(finish loading)
     function unblockUI(el) {
            $(el).unblock();
    }
	
	$(window).resize(function() {
			calculateHeight();
	});
	
	$(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }
    });
//***********************************BEGIN Function calls *****************************		
	$('.scrollup').click(function(){
		$("html, body").animate({ scrollTop: 0 }, 700);
		return false;
    });	
	 $("img").unveil();
    });	
	/*$( window ).resize(function() {
		  $.sidr('close', 'sidr');
	});
	*/
	function calculateHeight(){
			var contentHeight=parseInt($('.page-content').height());
			if(911 > contentHeight){	
				//console.log("Small");
			}	
	}	
	
/******* utility functions **************/
function log(msg) {
	if (typeof console !== 'undefined') {
		//console.log.apply(console, arguments);
		console.log(msg);
	}
}

function searchIdInArray(id,array) {
	var idx = -1;
	$.each(array,function(index,value){
		if(value.ID==id) {
			idx = index;
			return index;
		}
	});
	return idx;
}

function searchXinArray(x,array) {
	var idx = -1;
	$.each(array,function(index,value){
		if(value.x==x) {
			idx = index;
			return index;
		}
	});
	return idx;
}

function fancyAlert(msg) {
    $.fancybox({
        modal : true,
        content : '<div style="margin:1px;width:270px;" class="text-center">'+msg+
					'<div class="p-t-20">'+
						'<button class="btn btn-danger btn-cons" id="fancyAlert_ok">Ok</button>&nbsp;'+
					'</div>',
        afterShow : function() {
            $("#fancyAlert_ok").click(function() {
                $.fancybox.close();
            });
        }
    });
}

function fancySuccess(msg) {
    $.fancybox({
        modal : true,
        content : '<div style="margin:1px;width:270px;" class="text-center">'+msg+
					'<div class="p-t-20">'+
						'<button class="btn btn-primary btn-cons" id="fancyAlert_ok">Ok</button>&nbsp;'+
					'</div>',
        afterShow : function() {
            $("#fancyAlert_ok").click(function() {
                $.fancybox.close();
            });
        }
    });
}

function fancyConfirm(msg,callback) {
    var ret;
    var modalFancybox = $.fancybox({
        modal : true,
        content : '<div style="margin:1px;width:270px;" class="text-center">'+msg+
					'<div class="p-t-20">'+
						'<button class="btn btn-primary btn-cons" id="fancyConfirm_ok">Da</button>&nbsp;'+
						'<button class="btn btn-cancel btn-cons" id="fancyConfirm_cancel">Nu</button>'+
					'</div>',
        afterShow : function() {
            $("#fancyConfirm_cancel").click(function() {
                ret = false; 
                $.fancybox.close();
            });
            $("#fancyConfirm_ok").click(function() {
                ret = true; 
                $.fancybox.close();
            })
        },
        afterClose : function() {
            callback.call(this,ret);
        }
    });
}

function getRingStatus(status) {
    switch(status) {
		case 'Closed':
			return 'inchisa';
			break;
		case 'Opened':
			return 'deschisa';
			break;
		case 'PreOpened':
			return 'in deschidere';
			break;
		case 'PreClosed':
			return 'in inchidere';
			break;
		case 'NONE':
			return 'inchisa';
			break;
	}
}