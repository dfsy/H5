/**
 * @license
 * 初始化控件
 * Since: 2017/6/22
 * author : 吴俊鹏
 * emial :175417739@qq.com
 */
(function($, window, document, undefined) {
	window.WJPUI = $.WJPUI = {
		version: 'V1.0.0',
		split: ','
	};

})(jQuery, window, document);

/**
 * @license
 * 数据表格控件
 * Since: 2017/6/22
 * author : 吴俊鹏
 * emial :175417739@qq.com
 */
(function($, window, document, undefined) {

	var pluginName = 'datagrid'; //控件名称

	$.fn[pluginName] = function(options) { //为jquery附加方法
		if(this.length == 0) return;
		this.each(function(i) {
			var element = this;
			if($.data(element, pluginName)) return;
			$.WJPUI.Datagrid(element, options);
		});
	};

	$.WJPUI.Datagrid = function(element, options) {
		(new wjpDatagrid(element, options));

	};

	var wjpDatagrid = function(element, options) {
		this.element = element; //数据表格控件dom
		this.$element = $(element); //数据表格控件jquery
		this.options = $.extend({}, $.WJPUI.Datagrid.defaults, options); //合并已赋值参数;
		this._init(); //初始化
		$.data(this.element, pluginName, this); //保存到元素上
	};

	wjpDatagrid.prototype = {
		_init: function() { //初始化控件
			var opt = this.options,
				that = this;
			this._innerHtml()._setDatagridHeight();
			$(window).on('resize', function() {
				that._setDatagridHeight();
			});
		},

		_innerHtml: function() { //加载html内容
			var $grid = this.$element,
				templateStr = $.WJPUI.Datagrid._template,
				innerDom = {},
				opt = this.options;
			$grid.html($(templateStr));
			this._bindPageBar()._loadHead()._loadData();

			return this;
		},

		_loadHead: function() { //加载表头内容
			var $grid = this.$element,
				templateStr = $.WJPUI.Datagrid._template,
				opt = this.options;
			var $headPanel = $grid.find('.GridTableHead');
			if(WJP.Tools.IsArray(opt.columns)) {
				var thead = '<table style="margin-bottom:-1px" class="table wjpdatagrid"><thead><tr>';
				if(opt.rownumbers) {
					thead += '<th style="width:25px"></th>';
				}
				for(var i = 0; i < opt.columns.length; i++) {
					var col = $.extend({
						title: '列名',
						width: '',
						align: 'center',
						hidden: false
					}, opt.columns[i]);
					if(!col.hidden) {
						thead += "<th"
						if(WJP.Tools.IsNotEmpty(col.width)) {
							thead += " width='" + col.width + "'"
						}
						if(WJP.Tools.IsNotEmpty(col.align)) {
							thead += " align='center'"
						}
						thead += ">";
						thead += col.title;
						thead += "</th>";
					}
				}
				thead += '</tr></thead></table>';
				$headPanel.append(thead);
			}
			return this;
		},

		_loadData: function() { //读取数据
			var $grid = this.$element,
				templateStr = $.WJPUI.Datagrid._template,
				opt = this.options,
				that = this;
			this._showLoad();
			$.ajax({
				type: opt.type,
				url: opt.url,
				data: opt.data,
				dataType: 'json',
				contentType: 'application/x-www-form-urlencoded',
				async: true,
				cache: false,
				timeout: WJP.Static.overtime, //超时时间；
				success: function(backJson) {
					$grid.data('data', backJson);
					that._showData()._loadPageBar();
				},
				error: function() {
					mui.toast('对不起,服务器繁忙!!!', {
						duration: 'short',
						type: 'div'
					});
					that._hideLoad();
				}
			});
			return this;
		},

		_setDatagridHeight: function() {
			var $grid = this.$element,
				templateStr = $.WJPUI.Datagrid._template,
				opt = this.options,
				that = this;
			var totalHeight = $grid.height();
			var headHeight = $grid.find('.GridTableHead').height();
			var pagebarHeight = $grid.find('.pagebar').height();
			$grid.find('.GridTableBody').height(totalHeight - headHeight - pagebarHeight - 8);
			return this;
		},

		_loadPageBar: function() {
			var $grid = this.$element,
				templateStr = $.WJPUI.Datagrid._template,
				opt = this.options,
				rowNums = 0,
				that = this;
			if(opt.pagination) {
				$grid.find('.pagebar').show();
				var backJson = $grid.data('data');
				if(backJson && backJson.total && backJson.total > 0) {
					rowNums = backJson.total / opt.data.rows;
					if(backJson.total % opt.data.rows > 0) {
						rowNums++;
					}
					opt.rowNums = rowNums;
					$grid.find("#curPage").text(opt.data.page);
					$grid.find("#totalPage").text(parseInt(rowNums));
					$grid.find("#totalRows").text(backJson.total);
				} else {
					opt.rowNums = 0;
					$grid.find("#curPage").text(opt.data.page);
					$grid.find("#totalPage").text('0');
					$grid.find("#totalRows").text('0');
				}
			}
			return this;
		},

		_bindPageBar: function() {
			var $grid = this.$element,
				templateStr = $.WJPUI.Datagrid._template,
				opt = this.options,
				that = this;
			$grid.find('.mui-previous').on('tap', function() {
				if(opt.data.page > 1) {
					that._showLoad();
					opt.data.page--;
					that._loadData();
				} else {
					mui.toast('已到达最前页', {
						duration: 'short',
						type: 'div'
					})
				}
			});
			$grid.find('.mui-next').on('tap', function() {
				if(opt.data.page < opt.rowNums - 1) {
					that._showLoad();
					opt.data.page++;
					that._loadData();
				} else {
					mui.toast('已到达最后一页', {
						duration: 'short',
						type: 'div'
					})
				}
			});
			return this;
		},

		_showLoad: function() { //显示加载
			WJP.shadow.show();
			return this;
		},

		_hideLoad: function() { //隐藏加载
			WJP.shadow.hide();
			//this.$element.find('.rwpMidLoading').hide();
			return this;
		},

		_showData: function() {
			var $grid = this.$element,
				templateStr = $.WJPUI.Datagrid._template,
				opt = this.options;
			var backJson = $grid.data('data');
			if(backJson && backJson.total && backJson.total > 0) {
				var $table = $('<table class="table wjpdatagrid"><tbody></tbody></table>');
				for(var i = 0; i < backJson.rows.length; i++) {
					var row = backJson.rows[i];
					var $tr = $("<tr>", {
						style: 'height:45px',
						click: (function(r) { //通过函数闭包的方式来处理row的变量，避免每次都会获取最后一条row
							return function() {
								if(WJP.Tools.IsFunction(opt.rowsClick)) {
									opt.rowsClick(r);
								}
							};
						})(row)
					});
					$tr.prependTo($table);
					str = '';
					if(opt.rownumbers) {
						str += '<td style="width:25px">' + (i + 1) + '</td>';
					}
					for(var j = 0; j < opt.columns.length; j++) {
						var col = $.extend({
							field: '',
							width: '',
							align: 'center',
							hidden: false,
							isDencrypt: false,
							formatter: null
						}, opt.columns[j]);
						if(!col.hidden) {
							str += "<td"
							if(WJP.Tools.IsNotEmpty(col.width)) {
								str += " width='" + col.width + "'"
							}
							if(WJP.Tools.IsNotEmpty(col.align)) {
								str += " align='" + col.align + "'"
							}
							str += ">";
							if(WJP.Tools.IsNotEmpty(row[col.field])) {
								if(col.isDencrypt) {
									var key = WJP.Static.EncryptKey;
									if(WJP.Tools.IsNotEmpty(col.DencryptKey)) {
										key = col.DencryptKey;
									}
									try {
										str += WJP.Tools.dencryptByDES(row[col.field], key);
									} catch(e) {
										str += row[col.field];
									}
								} else {
									str += row[col.field];
								}
							}
							str += "</td>";
						}
					}
					$tr.append(str);
					//str += '</tr>';
				}

				//str += '</tbody></table>';
				//$table.prependTo($grid.find('.GridTableBody'));
				$grid.find('.GridTableBody').html($table);

			} else {
				var colspan = 0;
				for(var j = 0; j < opt.columns.length; j++) {
					var col = $.extend({
						field: '',
						width: '',
						align: 'center',
						hidden: false,
						isDencrypt: false,
						formatter: null
					}, opt.columns[j]);
					if(!col.hidden) {
						colspan++;
					}
				}
				var str = '<table class="table table-condensed wjpdatagrid"><tbody>'
				str += '<tr><td colspan="' + colspan + '" style="height:55px;color:gray">没有任何数据......</td></tr>'
				str += '</tbody></table>';
				$grid.find('.GridTableBody').html(str);
			}
			this._hideLoad();
			return this;
		},

		search: function(data) { //搜索数据
			var $grid = this.$element,
				templateStr = $.WJPUI.Datagrid._template,
				opt = this.options;
			opt.data.page = 1;
			$.extend(opt.data, data);
			this._loadData();
		}
	}

	$.WJPUI.Datagrid.defaults = { //默认参数
		url: '',
		type: 'post',
		data: {
			page: 1,
			rows: 10
		},
		columns: [],
		pagination: true, //是否分页
		rownumbers: true, //是否显示行号  
		idField: 'id',
		rowsClick: null
	};

	$.WJPUI.Datagrid._template = '<div class="GridTableHead"></div>' +
		//'<div class="rwpMidLoading"></div>' +
		'<div class="GridTableBody"></div>' +
		'<div class="pagebar">' +
		'<ul class="mui-pager">' +
		'<li class="mui-previous"><button style="font-size: 14px; padding: 5px 15px 5px 5px;" type="button" class="mui-btn mui-btn-link mui-btn-outlined mui-icon mui-icon-back ">上一页</button></li>' +
		'<li><h6 style="display: inline;  padding: 0px 5px 0px 5px;line-height:30px;">第 <span id="curPage">1</span> 页,共计 <span id="totalPage">0</span> 页 <span id="totalRows">0</span> 条</h6></li>' +
		'<li class="mui-next"><button style="font-size: 14px; padding: 5px 5px 5px 15px;" type="button" class="mui-btn mui-btn-link  mui-btn-outlined mui-icon mui-icon-forward mui-right">下一页</button></li>' +
		'</ul>' +
		'</div>';

	$.WJPUI.Datagrid.fn = wjpDatagrid; //指向wjpDatagrid

})(jQuery, window, document);

/**
 * @license
 * 选择器控件
 * Since: 2017/6/22
 * author : 吴俊鹏
 * emial :175417739@qq.com
 */
(function($) {
	var pluginName = 'selecter'; //选择器控件
	$.fn[pluginName] = function(options) { //为jquery附加方法
		if(this.length == 0) return;
		this.each(function(i) {
			var element = this;
			$.WJPUI.Selecter(element, options);
		});
	};

	$.WJPUI.Selecter = function(element, options) {
		(new wjpSelecter(element, options));
	};

	var wjpSelecter = function(element, options) {
		this.isLoadData = false;
		this.isSetData = false;
		this.element = element;
		this.$element = $(element);
		this.options = $.extend({}, $.WJPUI.Selecter.defaults, options); //合并已赋值参数;
		this._init()._loadHtml()._loadData(); //初始化
	};

	wjpSelecter.prototype = {
		_init: function() { //初始化控件
			var $ele = this.$element;
			$ele.after($.WJPUI.Selecter._template);
			this.$button = $ele.next().find('span');
			this.$hidden = $ele.next().find('input');
			if(WJP.Tools.IsNotEmpty($ele.text())) {
				this.options.text = $ele.text();
			}
			return this;
		},

		_loadHtml: function() {
			var that = this;
			this.$button.text(this.options.text)
				.attr('placeholder', this.options.text)
				.css({
					width: this.options.width,
					color: '#cccccc',
					'text-align': this.options.align
				})
				.on('tap', function() {
					var $but = that.$button,
						$inp = that.$hidden;
					if(that.isSetData) {
						that.userPicker.show(function(items) {
							if(WJP.Tools.IsNotEmpty(items[0].text)) {
								$but.text(items[0].text).css({
									color: '#000000'
								})
								$inp.val(items[0].value);
							}
						});
					} else {
						mui.toast('正在加载远程数据，请稍后...', {
							duration: 'short',
							type: 'div'
						});
					}

				})

			var id = this.$element.attr('id'),
				name = this.$element.attr('name');
			if(WJP.Tools.IsNotEmpty(id)) {
				this.$hidden.attr('id', id);
			}
			if(WJP.Tools.IsNotEmpty(name)) {
				this.$hidden.attr('name', name);
			}

			this.$element.remove();
			return this;
		},

		_loadData: function() {
			var opt = this.options,
				that = this;
			if(WJP.Tools.IsArray(opt.data)) {
				this.data = opt.data;
				this.isLoadData = true;
			} else if(WJP.Tools.IsNotEmpty(opt.url)) {
				$.ajax({
					type: opt.type,
					url: opt.url,
					data: opt.ajaxData,
					dataType: 'json',
					contentType: 'application/x-www-form-urlencoded',
					async: true,
					cache: false,
					timeout: 10000, //超时时间设置为10秒；
					success: function(backJson) {
						that.data = backJson;
						that.isLoadData = true;
					},
					error: function() {
						mui.toast('对不起,服务器繁忙!!!', {
							duration: 'short',
							type: 'div'
						});
						that.data = [];
						that.isLoadData = true;
					}
				});
			} else {
				mui.toast('配置错误!!!', {
					duration: 'short',
					type: 'div'
				});
				this.data = [];
				this.isLoadData = true;
			}

			(function(that) {
				var interval = setInterval(function() {
					if(that.isLoadData) {
						that.userPicker = new mui.PopPicker();
						that.userPicker.setData(that.data);
						that.isSetData = true;
						if(WJP.Tools.IsNotEmpty(that.options.value)) {
							that.userPicker.pickers[0].setSelectedValue(that.options.value);
							if(WJP.Tools.IsNotEmpty(that.userPicker.getSelectedItems()[0].value)) {
								that.$button.text(that.userPicker.getSelectedItems()[0].text).css({
									color: '#000000'
								});
								that.$hidden.val(that.userPicker.getSelectedItems()[0].value)
							}
						}
						clearInterval(interval);
					}
				}, 100);
			})(this);
			return this;
		}
	}

	$.WJPUI.Selecter.defaults = { //默认参数
		text: '请选择',
		url: '',
		data: null, //选择的数据源
		ajaxData: {}, //请求ajax的参数
		type: 'post',
		width: '100%', //生成控件的宽度
		align: 'left', //生成控件的字体方向
		value: null //用于自动赋值
	};

	$.WJPUI.Selecter._template = '<div class="selecterPanel">' +
		'<span style="padding:15px;cursor: pointer;text-align:right" class="mui-icon mui-icon-arrowdown mui-right wjpinput selecterButton"></span>' +
		//		'<button style="float: left; border: 0px;"  class="mui-btn mui-btn-block wjpinput selecterButton" type="button"></button>' +
		'<input type="hidden" class="selecterHidden" /></div>';

	$.WJPUI.Selecter.fn = wjpSelecter; //指向wjpDatagrid

})(jQuery);

/**
 * @license
 * 日期选择器控件
 * Since: 2017/6/22
 * author : 吴俊鹏
 * emial :175417739@qq.com
 */
(function($) {
	var pluginName = 'datetime'; //选择器控件
	$.fn[pluginName] = function(options) { //为jquery附加方法
		if(this.length == 0) return;
		this.each(function(i) {
			var element = this,
				optionsJson = $(this).attr('data-options') || '{}';
			options = $.extend({}, options, JSON.parse(optionsJson));
			$.WJPUI.DateTime(element, options);
		});
	};

	$.WJPUI.DateTime = function(element, options) {
		(new wjpDateTime(element, options));
	};

	var wjpDateTime = function(element, options) {
		this.isLoadData = false;
		this.element = element;
		this.$element = $(element);
		this.options = $.extend({}, $.WJPUI.DateTime.defaults, options); //合并已赋值参数;
		this._init()._loadHtml(); //初始化
	};

	wjpDateTime.prototype = {
		_init: function() { //初始化控件
			var $ele = this.$element;
			$ele.after($.WJPUI.DateTime._template);
			this.$button = $ele.next().find('span');
			this.$hidden = $ele.next().find('input');
			return this;
		},

		_loadHtml: function() {
			var that = this;
			if(WJP.Tools.IsNotEmpty(this.options.value)) {
				this.$hidden.val(this.options.value);
				this.$button.html(this.options.value).css({
					color: '#000000'
				});
			} else {
				this.$button.html(this.options.text).css({
					color: '#cccccc'
				});
			}
			this.$button.attr('placeholder', this.options.text)
				.css({
					width: this.options.width,
					'text-align': this.options.align
				})
				.on('tap', function() {
					var $but = that.$button,
						$inp = that.$hidden;
					if(WJP.Tools.IsNotEmpty($inp.val())) {
						that.options.value = $inp.val();
					}
					var picker = new mui.DtPicker(that.options);
					picker.show(function(rs) {
						$but.text(rs.text).css({
							color: '#000000'
						});
						$inp.val(rs.text);
						picker.dispose();
					});

				})

			var id = this.$element.attr('id'),
				name = this.$element.attr('name');
			if(WJP.Tools.IsNotEmpty(id)) {
				this.$hidden.attr('id', id);
			}
			if(WJP.Tools.IsNotEmpty(name)) {
				this.$hidden.attr('name', name);
			}

			this.$element.remove();
			return this;
		},

	}

	$.WJPUI.DateTime.defaults = { //默认参数
		type: "time",
		text: '请选择日期',
		value: null,
		beginYear: 1949,
		endYear: 2049,
		align: 'right'
	};

	$.WJPUI.DateTime._template = '<div class="datetimePanel">' +
		'<span style="padding:15px;cursor: pointer;text-align:right" class="mui-icon mui-icon-compose mui-right wjpinput selecterButton"></span>' +
		'<input type="hidden" class="selecterHidden" /></div>';

	$.WJPUI.DateTime.fn = wjpDateTime; //指向wjpDatagrid

})(jQuery);

/**
 * @license
 * 地区选择器控件
 * Since: 2017/6/22
 * author : 吴俊鹏
 * emial :175417739@qq.com
 */
(function($) {
	var pluginName = 'address'; //选择器控件
	$.fn[pluginName] = function(options) { //为jquery附加方法
		if(this.length == 0) return;
		this.each(function(i) {
			var element = this
			$.WJPUI.Address(element, options);
		});
	};

	$.WJPUI.Address = function(element, options) {
		(new wjpAddress(element, options));
	};

	var wjpAddress = function(element, options) {
		this.element = element;
		this.$element = $(element);
		this.options = $.extend({}, $.WJPUI.Address.defaults, options); //合并已赋值参数;
		this._init()._loadPicker()._loadHidden()._loadButton(); //初始化
		this.$element.remove();
	};

	wjpAddress.prototype = {
			_init: function() { //初始化控件
				var $ele = this.$element;
				$ele.after($.WJPUI.Address._template);
				this.$button = $ele.next().find('span');
				this.$hiddens = $ele.next().find('input[type="hidden"]');
				return this;
			},

			_loadPicker: function() {
				var $ele = this.$element,
					opt = this.options,
					addressData, count = 0,
					vals;
				if(WJP.Tools.IsNotEmpty(opt.value)) {
					vals = opt.value.split(',');
				}
				(function(that, c) {
					var interval = setInterval(function() {
						c++;
						addressData = WJP.BaseData.GetAddress();
						if(WJP.Tools.IsArray(addressData) || c >= 50) {
							that.userPicker = new mui.PopPicker({
								layer: 3
							});
							that.userPicker.setData(addressData);
							if(vals && vals.length == 3) {
								var butStr = null;
								if(vals[0] > 0) {
									that.userPicker.pickers[0].setSelectedValue(vals[0], 0, function() {
										butStr = that.userPicker.getSelectedItems()[0].text
										that.$button.text(butStr).css({
											color: '#000000'
										})
										if(vals[1] > 0) {
											that.userPicker.pickers[1].setSelectedValue(vals[1], 0, function() {
												butStr += ('-' + that.userPicker.getSelectedItems()[1].text);
												that.$button.text(butStr).css({
													color: '#000000'
												})
												if(vals[2] > 0) {
													that.userPicker.pickers[2].setSelectedValue(vals[2], 0, function() {
														butStr += ('-' + that.userPicker.getSelectedItems()[2].text);
														that.$button.text(butStr).css({
															color: '#000000'
														})
													});
												}
											});
										}
									});
								}
							};
							clearInterval(interval);
						}
					}, 100);
				})(this, count);

				return this;
			},

			_loadHidden: function() {
				var $ele = this.$element,
					opt = this.options,
					names, vals;
				names = $ele.attr('name').split(',');
				if(WJP.Tools.IsNotEmpty(opt.value)) {
					vals = opt.value.split(',');
				}
				if(names && names.length == 3) {
					$ele.next().find('input[type="hidden"]').each(function(item) {
						$(this).attr('name', names[item]);
					})
				}

				if(vals && vals.length == 3) {
					$ele.next().find('input[type="hidden"]').each(function(item) {
						$(this).val(vals[item]);
					})
				}
				return this;
			},

			_loadButton: function() {
				var $ele = this.$element,
					opt = this.options,
					vals, that = this;
				if(WJP.Tools.IsNotEmpty(opt.value)) {
					vals = opt.value.split(',');
				}
				this.$button = $ele.next().find('span').css({
					width: opt.width,
					color: '#cccccc',
					'text-align': opt.align
				}).attr('placeholder', opt.text).text(opt.text).on('tap', function() {
					that.userPicker.show(function(items) {
						that.$hiddens.each(function(index) {
							$(this).val(items[index].value);
						})
						var text = items[0].text + '-' + items[1].text + '-' + items[2].text
						that.$button.text(text).css({
							color: '#000000'
						});
					});
				});
				if(vals && vals.length == 3) {
					//加载文字数据在_loadPicker方法中，因为涉及到 settimeout延时问题，在该方法中可以获取不到数据
				};

				return this;
			}

		},

		$.WJPUI.Address.defaults = { //默认参数
			text: '请选择地区',
			value: null, //多个地区用逗号隔开
			align: 'right',
			width: '99%'
		};

	$.WJPUI.Address._template = '<div class="addressPanel">' +
		'<span style="padding:15px;cursor: pointer;text-align:right" class="mui-icon mui-icon-arrowdown mui-right wjpinput selecterButton"></span>' +
		'<input type="hidden" class="selecterHidden" /><input type="hidden" class="selecterHidden" /><input type="hidden" class="selecterHidden" /></div>';
	$.WJPUI.Address.fn = wjpAddress;

})(jQuery);