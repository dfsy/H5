(function(win, $) {
	//	var _back = mui.back;
	//	mui.back = function() {
	//		//首次退出
	//		//		var btnArray = ['取消', '退出登录'];
	//		//		plus.nativeUI.confirm("请选择你所需要的操作", function(e) {
	//		//			switch(e.index) {
	//		//				case 0:
	//		//					break;
	//		//				case 1:
	//		//					WJP.User.Clear();
	//		//					plus.runtime.quit();
	//		//					break;
	//		//				default:
	//		//					break;
	//		//			}
	//		//		}, "温馨提示", btnArray);
	//	};
	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	// 例子： 
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
	Date.prototype.Format = function(fmt) { //author: meizz 
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}

	win.WJP = {
		Static: {
			CrmURL: 'http://192.168.29.219/WJPDefault/API/Crm/',
			FlowURL: 'http://122.225.201.35:97/api/flow/',
			ProjectURL: 'http://122.225.201.35:95/TestApp/',
			EncryptKey: 'test2016', //,  66fh3036(数据库解密)  *xxb$df%参数解密
			paramKey: '*xxb$df%',
			overtime: 40000,
			errorMes: '服务器繁忙，请稍后再试...'
		},
		Tools: {
			encryptByDES: function(message, key) {
				if(WJP.Tools.IsEmpty(key)) {
					key = WJP.Static.EncryptKey;
				}
				var keyHex = CryptoJS.enc.Utf8.parse(key);
				var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.Pkcs7
				});
				return encrypted.toString();
			},
			dencryptByDES: function(message, key) {
				if(WJP.Tools.IsEmpty(key)) {
					key = WJP.Static.EncryptKey;
				}
				var keyHex = CryptoJS.enc.Utf8.parse(key);
				var decrypted = CryptoJS.DES.decrypt({
					ciphertext: CryptoJS.enc.Base64.parse(message)
				}, keyHex, {
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.Pkcs7
				});
				return decrypted.toString(CryptoJS.enc.Utf8);
			},
			Ajax: function(parames) {
				parames = $.extend({
					Url: '',
					data: null,
					async: true,
					success: null,
					error: null,
					timeout: WJP.Static.overtime, //超时时间
					type: 'post',
					waitMsg: '正在处理中......'
				}, parames);
				WJP.shadow.show({
					text: parames.waitMsg
				})
				//plus.nativeUI.showWaiting(parames.waitMsg);
				$.ajax({
					type: parames.type,
					data: parames.data,
					timeout: parames.timeout,
					url: parames.Url,
					async: parames.async,
					cache: false,
					dataType: "json",
					contentType: 'application/json;charset=utf-8',
					success: function(data) {
						if(WJP.Tools.IsFunction(parames.success)) {
							parames.success(data);
						}
						WJP.shadow.hide();
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//plus.nativeUI.closeWaiting();
						WJP.shadow.hide();
						plus.nativeUI.alert(WJP.Static.errorMes);

					}
				});
			},
			IsFunction: function(fun) {
				try {
					if(typeof(eval(fun)) == "function") {
						return true;
					}
				} catch(e) {

				}
				return false;
			},
			//判断字符串或数组是否非空如果不为空返回true
			IsNotEmpty: function(str) {
				if(str && str != null && str != "null") {
					if(isNaN(str)) {
						return str.length > 0;
					} else {
						return true;
					}
					return true;
				} else {
					return false;
				}
			},
			IsEmpty: function(str) {
				if(str && str != null && str != "null" && str.toString().length > 0) {
					return false;
				} else {
					return true;
				}
			},
			IsJson: function(obj) {
				var isjson = obj != null && typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
				return isjson;
			},

			//判断是否为数组并且数据不能为空
			IsArray: function(obj) {
				var isok = Object.prototype.toString.call(obj) === '[object Array]';
				if(isok && obj != null && obj.length > 0) {
					return true;
				} else {
					return false;
				}
			},
			GetPath: function()　　 {　　　　
				var url = document.location.toString();　　　　
				var arrUrl = url.split("//");

				　　　　
				var start = arrUrl[1].indexOf("/");　　　　
				var relUrl = arrUrl[1].substring(start); //stop省略，截取从start开始到结尾的所有字符

				　　　　
				if(relUrl.indexOf("?") != -1) {　　　　　　
					relUrl = relUrl.split("?")[0];　　　　
				}　　　　
				return relUrl;　　
			}
		},
		User: {
			UserKey: 'UserInfo',
			Get: function() {
				return plus.storage.getItem(WJP.User.UserKey);
			},
			Set: function() {
				plus.storage.setItem(WJP.User.UserKey, 'wjpwjp');
			},
			Clear: function() {
				plus.storage.removeItem(WJP.User.UserKey);
			},
			IsNotLogin: function() {
				return WJP.Tools.IsEmpty(WJP.User.Get());
			}
		},
		BaseData: {
			AddressKey: 'AddressKey',
			BaseTypeKey: 'BaseTypeKey',
			SetBaseType: function() {
				$.ajax({

					type: 'post',
					url: WJP.Static.CrmURL + 'GetBaseTypes',
					data: {
						EnumID: 0
					},
					dataType: 'json',
					contentType: 'application/x-www-form-urlencoded',
					async: true,
					cache: false,
					timeout: WJP.Static.overtime, //超时时间设置为10秒；
					success: function(backJson) {
						plus.storage.setItem(WJP.BaseData.BaseTypeKey, JSON.stringify(backJson));
					},
					error: function() {
						mui.toast('对不起,获取基础数据失败!!!', {
							duration: 'short',
							type: 'div'
						});
					}
				});
			},
			GetBaseType: function(EnumID) {
				var baseStr = plus.storage.getItem(WJP.BaseData.BaseTypeKey);
				if(WJP.Tools.IsNotEmpty(baseStr)) {
					var allJson = $.parseJSON(baseStr);
					var baseJson = [];
					for(var i = 0; i < allJson.length; i++) {
						var json = allJson[i];
						if(json.EnumID == EnumID && json.ParentID != 0 && WJP.Tools.IsNotEmpty(json.TypeName)) {
							baseJson.push({
								value: json.ID,
								text: json.TypeName
							})
						}
					}
					return baseJson;
				} else {
					return null;
				}
			},
			SetAddress: function() {
				$.ajax({
					type: 'post',
					url: WJP.Static.CrmURL + 'GetAddress',
					dataType: 'json',
					contentType: 'application/x-www-form-urlencoded',
					async: true,
					cache: false,
					timeout: WJP.Static.overtime, //超时时间设置为10秒；
					success: function(backJson) {
						plus.storage.setItem(WJP.BaseData.AddressKey, JSON.stringify(backJson));
					},
					error: function() {
						mui.toast('对不起,获取地址数据失败!!!', {
							duration: 'short',
							type: 'div'
						});
					}
				});
			},
			GetAddress: function() {
				var addStr = plus.storage.getItem(WJP.BaseData.AddressKey);
				if(WJP.Tools.IsNotEmpty(addStr)) {
					return $.parseJSON(addStr);
				} else {
					return null;
				}
			}

		},
		PageInits: function(parames) {
			parames = $.extend({
				JustLogin: true //必须登录
			}, parames);
			if(parames.JustLogin) {
				if(this.User.IsNotLogin()) {
					mui.openWindow({
						url: '/login.html',
						id: 'login.html',
						show: {
							autoShow: true, //页面loaded事件发生后自动显示，默认为true
							//aniShow: action, //页面显示动画，默认为”slide-in-right“；
							duration: 100 //页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；
						},
						waiting: {
							autoShow: true, //自动显示等待框，默认为true
							title: "正在加载请稍后..." //等待对话框上显示的提示内容
						}
					})
				}
			} else {
				alert('无需登录!!!');
			}
		},
		ComputeHeight: function(parames) {
			parames = $.extend({
				$Exclude: null,
				$set: null,
				attachHeigh: 8
			}, parames);
			var ExcludeHeight = parames.attachHeigh;
			if(this.Tools.IsNotEmpty(parames.$Exclude)) {
				parames.$Exclude.each(function() {
					ExcludeHeight += $(this).outerHeight(true);
				})
			}
			var result = $(window).outerHeight(true) - ExcludeHeight;
			//			console.log('window=' + $(window).outerHeight(true) + ',result=' + result + ',ExcludeHeight=' + ExcludeHeight);
			if(this.Tools.IsNotEmpty(parames.$set)) {
				parames.$set.each(function() {
					$(this).css({
						'height': result
					});
				})
			}
		},
		openWindowWithTitle: function(parames) {
			parames = $.extend({
				url: null,
				id: null,
				text: '',
				isBack: true
			}, parames);
			mui.openWindowWithTitle({
				url: parames.url,
				id: parames.id,
			}, {
				height: "60px", //导航栏高度值
				backgroundColor: "#007aff", //导航栏背景色
				bottomBorderColor: "#cccccc", //底部边线颜色
				title: { //标题配置
					text: parames.text,
					position: { //绘制文本的目标区域，参考：http://www.html5plus.org/doc/zh_cn/nativeobj.html#plus.nativeObj.Rect
						top: '13px',
						width: "100%",
						height: "100%"
					},
					styles: { //绘制文本样式，参考：http://www.html5plus.org/doc/zh_cn/nativeobj.html#plus.nativeObj.TextStyles
						color: "#FFFFFF"
					}
				},
				back: { //左上角返回箭头
					image: {
						base64Data: win.BackImages,
						sprite: { //图片源的绘制区域，参考：http://www.html5plus.org/doc/zh_cn/nativeobj.html#plus.nativeObj.Rect
							top: '0px',
							left: '0px',
							width: '100%',
							height: '100%'
						},
						position: { //绘制图片的目标区域，参考：http://www.html5plus.org/doc/zh_cn/nativeobj.html#plus.nativeObj.Rect
							top: "30px",
							left: "10px",
							width: "24px",
							height: "20px"
						}
					},
					click: function() {
						if(parames.isBack) {
							var ws = plus.webview.getWebviewById(parames.id);
							plus.webview.close(ws);
						}
					}
				}
			})
		},
		form: {
			/**
			 * 文本框根据输入内容自适应高度
			 * @param                {HTMLElement}        输入框元素
			 * @param                {Number}                设置光标与输入框保持的距离(默认0)
			 * @param                {Number}                设置最大高度(可选)
			 */
			Textarea: function(elem, extra, maxHeight) {
				extra = extra || 0;
				var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
					isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),
					addEvent = function(type, callback) {
						elem.addEventListener ?
							elem.addEventListener(type, callback, false) :
							elem.attachEvent('on' + type, callback);
					},
					getStyle = elem.currentStyle ? function(name) {
						var val = elem.currentStyle[name];

						if(name === 'height' && val.search(/px/i) !== 1) {
							var rect = elem.getBoundingClientRect();
							return rect.bottom - rect.top -
								parseFloat(getStyle('paddingTop')) -
								parseFloat(getStyle('paddingBottom')) + 'px';
						};
						return val;
					} : function(name) {
						return getComputedStyle(elem, null)[name];
					},
					minHeight = parseFloat(getStyle('height'));

				elem.style.resize = 'none';

				var change = function() {
					var scrollTop, height,
						padding = 0,
						style = elem.style;

					if(elem._length === elem.value.length) return;
					elem._length = elem.value.length;

					if(!isFirefox && !isOpera) {
						padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
					};
					scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

					elem.style.height = minHeight + 'px';
					if(elem.scrollHeight > minHeight) {
						if(maxHeight && elem.scrollHeight > maxHeight) {
							height = maxHeight - padding;
							style.overflowY = 'auto';
						} else {
							height = elem.scrollHeight - padding;
							style.overflowY = 'hidden';
						};
						style.height = height + 20 + extra + 'px';
						scrollTop += parseInt(style.height) - elem.currHeight;
						document.body.scrollTop = scrollTop;
						document.documentElement.scrollTop = scrollTop;
						elem.currHeight = parseInt(style.height);
					};
				};

				addEvent('propertychange', change);
				addEvent('input', change);
				addEvent('focus', change);
				change();

			},
			reset: function(parames) {
				parames = $.extend({
					$form: null
				}, parames);
				parames.$form[0].reset();
				parames.$form.find('.selecterButton').each(function() {
					var defalutText = $(this).attr('placeholder');
					if(WJP.Tools.IsEmpty(defalutText)) {
						defalutText = '请选择';
					}
					$(this).text(defalutText).css({
						color: '#CCCCCC'
					});
				});
				parames.$form.find('.selecterHidden').each(function() {
					$(this).val('');
				})
			},
			search: function(parames) {
				parames = $.extend({
					$form: null,
					$datagrid: null
				}, parames);

				var arr = parames.$form.serializeArray();
				if(WJP.Tools.IsArray(arr)) {
					var data = {};
					for(var i = 0; i < arr.length; i++) {
						var j = arr[i];
						if(WJP.Tools.IsNotEmpty(j.name)) {
							data[j.name] = j.value;
						}
					}
					parames.$datagrid.data('datagrid').search(data);
				}
			},
			submit: function(parames) {
				parames = $.extend({
					$form: null,
					success: null,
					url: null
				}, parames);
				var isVali = true;
				parames.$form.find("[wjp]").each(function(index) {
					var str = $(this).attr('wjp'),
						json = {},
						vali = null;
					if(WJP.Tools.IsJson(str)) {
						json = str;
					} else {
						json = JSON.parse(str)
					}
					vali = json.vali;
					if(WJP.Tools.IsJson(vali)) {
						switch(vali.type) {
							case "string":
								if(WJP.Tools.IsEmpty($(this).val())) {
									isVali = false;
									var msg = WJP.Tools.IsNotEmpty(vali.msg) ? vali.msg : '参数不能为空!!!'
									mui.toast(msg, {
										duration: 'short',
										type: 'div'
									});
									return false;
								}
								break;
							case "int":
								if(WJP.Tools.IsEmpty($(this).val()) || $(this).val() <= 0) {
									isVali = false;
									var msg = WJP.Tools.IsNotEmpty(vali.msg) ? vali.msg : '参数不能为空!!!'
									mui.toast(msg, {
										duration: 'short',
										type: 'div'
									});
									return false;
								}
								break;
						}
					}
				});
				if(!isVali) {
					return;
				}
				var arr = parames.$form.serializeArray();
				if(WJP.Tools.IsArray(arr)) {
					var data = {};
					for(var i = 0; i < arr.length; i++) {
						var j = arr[i];
						if(WJP.Tools.IsNotEmpty(j.name)) {
							data[j.name] = j.value;
						}
					}
					WJP.Tools.Ajax({
						Url: parames.url,
						data: data,
						success: function(result) {
							if(result.stateType == 0) {
								if(WJP.Tools.IsFunction(parames.success)) {
									parames.success(result, data);
								}
							} else {
								alert(result.stateMsg);
							}
						},
						waitMsg: '正在提交,请稍后......'
					});
				}
			},
			loadPage: function(opt) {
				opt = $.extend({
					computeHei: null, //计算高度(json)
					$scroll: null, //滚动条
					focus: {
						isFocus: false, //是否需要计算滚动条的位置
						$reference: null, //用于计算滚动条被输入法遮挡需要滚动位置参照物
						scrollFun: null //当前属于哪一个滚动条,默认为0(回调方法)
					},
					$pannel: null, //用于加载页面的容器,只操作容器内的元素
					isAjax: false,
					data: null,
					ajax: {
						type: 'POST',
						data: null,
						url: null,
						success: null,
						error: null
					},
					loadBefore: null, //必须返回值为bool型
					loadAfter: null //加载完成之后的回调函数
				}, opt);

				if(WJP.Tools.IsFunction(opt.loadBefore)) {
					opt.loadBefore();
				}
				WJP.shadow.show();
				if(WJP.Tools.IsJson(opt.computeHei)) {
					WJP.ComputeHeight(opt.computeHei);
					$(win).resize(function(e) {
						WJP.ComputeHeight(opt.computeHei);
						if(opt.focus.isFocus) {
							var index = 0;
							if(WJP.Tools.IsFunction(opt.focus.scrollFun)) {
								try {
									index = opt.focus.scrollFun();
								} catch(e) {
									index = 0;
								}
							}
							var cur = opt.$scroll.scroll()[index];
							if($(":focus").length > 0) {
								var s1 = $(":focus").offset().top - cur.y,
									s2 = opt.focus.$reference.offset().top;
								setTimeout(function() {
									if(s1 > s2) {
										cur.scrollTo(0, s2 - (s1 + $(":focus").outerHeight(true)), 0);
									}
								}, 100);
							}
						}
					});
				}
				if(opt.$scroll) {
					opt.$scroll.scroll({
						bounce: false,
						indicators: true, //是否显示滚动条
						deceleration: mui.os.ios ? 0.003 : 0.0009
					});
				}
				if(opt.isAjax) {
					$.ajax({
						type: opt.ajax.type,
						data: opt.ajax.data,
						url: opt.ajax.url,
						async: true,
						cache: false,
						dataType: "json",
						success: function(json) {
							opt.data = json;
							loadValue(); //加载页面数据
							loadTextareaSize(); //加载textarea自适应
							loadSelecter(); //加载选择器
							if(WJP.Tools.IsFunction(opt.ajax.success)) {
								opt.ajax.success(json);
							}
							if(WJP.Tools.IsFunction(opt.loadAfter)) {
								opt.loadAfter(json);
							}

							WJP.shadow.hide();

						},
						error: function(e) {
							alert(WJP.Static.errorMes);
							WJP.shadow.hide();
						}
					});
				} else if(WJP.Tools.IsJson(opt.data)) {
					loadValue(); //加载页面数据
					loadTextareaSize(); //加载textarea自适应
					loadSelecter(); //加载选择器
					if(WJP.Tools.IsFunction(opt.loadAfter)) {
						opt.loadAfter();
					}
					WJP.shadow.hide();

				} else {
					loadTextareaSize(); //加载textarea自适应
					loadSelecter(); //加载选择器
					if(WJP.Tools.IsFunction(opt.loadAfter)) {
						opt.loadAfter();
					}
					WJP.shadow.hide();
				}

				function loadTextareaSize() {
					$('textarea').each(function() {
						WJP.form.Textarea(this);
					})
				}

				function loadSelecter() {
					if(opt.$pannel) {
						opt.$pannel.find("[wjp]").each(function(index) {
							var str = $(this).attr('wjp');
							var json = {};
							if(WJP.Tools.IsJson(str)) {
								json = str;
							} else {
								json = JSON.parse(str)
							}
							if(json.type) {
								var type = json.type;
								switch(type) {
									case "buttonSelecter":
										if(json.EnumID && json.EnumID > 0) {
											$(this).selecter({
												data: WJP.BaseData.GetBaseType(json.EnumID),
												text: $(this).text(),
												width: '65%',
												align: 'right',
												value: $(this).attr('value')
											});
										}
										break;
									case "dateSelecter":
										$(this).datetime({
											text: $(this).text(),
											align: 'right',
											width: '65%',
											value: $(this).attr('value')
										});
										break;
									case "addressSelecter":
										$(this).address({
											text: $(this).text(),
											align: 'right',
											width: '65%',
											value: $(this).attr('value')
										});
										break;
								}
							}
						});
					}

				}

				function loadValue() {
					if(opt.$pannel) {
						opt.$pannel.find("[wjp]").each(function(index) {
							var str = $(this).attr('wjp');
							var json = {};
							if(WJP.Tools.IsJson(str)) {
								json = str;
							} else {
								json = JSON.parse(str)
							}

							if(json.type) {
								var type = json.type,
									jsonName = json.jn,
									val = opt.isAjax || WJP.Tools.IsJson(opt.data) ? getStr(opt.data, jsonName) : null,
									columns;
								switch(type) {
									case "span":
										if(WJP.Tools.IsNotEmpty(val)) {
											$(this).text(val);
										}
										break;
									case "input":
									case "textarea":
										if(WJP.Tools.IsNotEmpty(val)) {
											$(this).val(val);
										}
										break;
									case "buttonSelecter":
									case "addressSelecter":
									case "dateSelecter":
										if(WJP.Tools.IsNotEmpty(val)) {
											if(WJP.Tools.IsNotEmpty(json.formatter)) {
												val = new Date(val).Format(json.formatter)
											}
											$(this).attr('value', val);
										}
										break;
									case "table":
										columns = json.columns;
										var colArr = WJP.Tools.IsNotEmpty(columns) ? columns.split(',') : null;
										var cospan = colArr.length;
										$(this).find('tr[name="nullTR"]').remove();
										$(this).find('tbody tr').remove();
										if(WJP.Tools.IsArray(colArr)) {
											if(WJP.Tools.IsArray(val)) {
												for(var i = 0; i < val.length; i++) {
													var row = val[i];
													var $tr = $('<tr id=' + row[json.PK] + '>');
													$tr.click((function(r) { //通过函数闭包的方式来处理row的变量，避免每次都会获取最后一条row
														return function() {
															if(WJP.Tools.IsNotEmpty(json.callBack)) {
																try {
																	eval("" + json.callBack + "(r,$tr)");
																} catch(e) {
																	alert(WJP.Static.errorMes);
																}
															}
														}
													})(row));
													for(var j = 0; j < colArr.length; j++) {
														var col = colArr[j];
														$tr.append('<td>' + row[col] + '</td>');
													}
													$tr.prependTo($(this).find('tbody'));
												}
											} else {
												$(this).find('tbody').append('<tr name="nullTR"><td style="height:45px;color:gray" colspan="' + cospan + '">未填写任何数据......</td></tr>');
											}
										}
										break;
								}
							}
						});
					}

					function getStr(data, JsonName) {
						var str;
						if(WJP.Tools.IsArray(JsonName)) {
							str = '';
							for(var i = 0; i < JsonName.length; i++) {
								str += ((i > 0 ? "," : "") + getJsonValue(data, JsonName[i].split('.')));
							}
						} else {
							str = getJsonValue(data, JsonName.split('.'));
						}
						return str;
					}

					function getJsonValue(data, arr) {
						for(var i = 0; i < arr.length; i++) {
							data = getObj(data, arr[i]);
						}
						return data;
					}

					function getObj(data, key) {
						if(WJP.Tools.IsJson(data)) {
							return data[key];
						}
						return null;
					}

				}
			}
		},
		shadow: {
			show: function(parames) {
				parames = $.extend({
					text: '加载中'
				}, parames);
				if($('.rwpMidLoading').length <= 0) {
					var html = '<div class="rwpMidLoading">' +
						'<div> ' + parames.text + '</div>' +
						'</div>';
					$('body').append(html);
				}
			},
			hide: function() {
				$('.rwpMidLoading').remove();
			}
		}
	};
})(window, jQuery);