fill_iblock_selector = function(){
    params = {
        'IBLOCK_TYPE_ID': 'lists'
    }
    params = {
        'IBLOCK_TYPE_ID': 'lists',
        'select': ['NAME', 'ID']

    };
    BX24.callMethod(
        'lists.get',
        params,
        function (result) {
            if (result.error()) {
                return false;
            } else {
                iblocks = result.answer.result;
                iblocks.forEach(function(v){
                    option = $('<option>',{
                        'value': v.ID,
                        'text': v.NAME
                    });
                    $('#iblock_selector').append(option);
                });
            }
        }
    );
}

render_iblock_list = function(type='fields') {
    params = {
        'IBLOCK_TYPE_ID': 'lists',
        'select': ['NAME', 'ID']

    };
    BX24.callMethod(
        'lists.get',
        params,
        function (result) {
            if (result.error()) {
                return false;
            } else {
                list_elements = result.answer.result;
                list_elements.forEach(function(v){
                    element = $('<div>',{
                        'text': v.NAME,
                        'class': 'iblock-list-element list-group-item list-group-item-action'
                    });
                    element.data('iblock_id',v.ID);
                    if(type=='fields') {
                        $('.iblock-list-container').append(element);
                    }
                    if(type=='elements'){
                        $('.iblock-list-elements-container').append(element);
                    }

                });
                if(type=='fields'){
                    $('.iblock-list-element').on('click',choose_iblock);
                }
                if(type=='elements'){
                    $('.iblock-list-element').on('click',choose_iblock_elements);
                }
            }
        });
}
choose_iblock_elements = function(){
    $('.iblock-list-elements-selected').empty();
    $('.iblock-list-elements-template').empty();
    id = $(this).data('iblock_id');
    params = {
        'IBLOCK_TYPE_ID': 'lists',
        'IBLOCK_ID': id,
    }
    BX24.callMethod(
        'lists.element.get',
        params,
        function (result) {
            if(result.error()) {
                return false;
            }else{
                fields = result.answer.result;
                Object.keys(fields).forEach(function(k){
                    v = fields[k];
                    element = $('<div>',{
                        'text': v.NAME,
                        'class': 'iblock-field-name list-group-item list-group-item-action'
                    });
                    element.data('el_id',v.ID);
                    element.data('ib_id',id);
                    element.on('click',render_templates_list_for_generate);
                    $('.iblock-list-elements-selected').append(element);
                });
            }
        }
    );

}

choose_iblock = function(){
    $('.iblock-field-name-container').empty();
    $('.iblock-field-detail-container').empty();
    id = $(this).data('iblock_id');
    params = {
        'IBLOCK_TYPE_ID': 'lists',
        'IBLOCK_ID': id,
    }
    BX24.callMethod(
        'lists.field.get',
        params,
        function (result) {
           if(result.error()) {
               return false;
           }else{
               fields = result.answer.result;
               Object.keys(fields).forEach(function(k){
                   v = fields[k];
                   element = $('<div>',{
                       'text': v.NAME,
                       'class': 'iblock-field-name list-group-item list-group-item-action'
                   });
                   element.data('field_data',JSON.stringify(v));
                   element.on('click',choose_field);
                   $('.iblock-field-name-container').append(element);
               });
           }
        }
    );

}

choose_field = function(){
    $('.iblock-field-detail-container').empty();
    selected = ['FIELD_ID','NAME','IS_REQUIRED','MULTIPLE','TYPE'];
    $('.iblock-field-detail-container').empty();
    var field_data = JSON.parse($(this).data('field_data'));
    if(field_data.TYPE=='S:employee') {
        BX24.callMethod('user.fields',{},function(result){
            s_field_data = result.answer.result;
            Object.keys(s_field_data).forEach(function (k) {
                v = s_field_data[k];
                code_button = $('<div>', {
                    'html': '<b>'+v+'</b><br>Код для вставки: {' + field_data['FIELD_ID'] + '_' + k +'}',
                    'class': 'iblock-field-detail-copy-code list-group-item list-group-item-action'
                });
                code_button.on('click', function () {
                    navigator.clipboard.writeText('{'+field_data['FIELD_ID'] + '_' + k +'}');
                });
                $('.iblock-field-detail-container').append(code_button);
            });
        });
    }else if(field_data.TYPE=='S:ECrm'){
        arMethods = {
            'Лид': 'crm.lead.fields',
            'Контакт': 'crm.contact.fields',
            'Компания': 'crm.company.fields',
            'Сделка': 'crm.deal.fields'
        }
        var dont_use = ['crm_currency', 'user', 'crm_status', 'location', 'crm_company', 'crm_contact',
            'crm_category', 'crm_lead','file'];
        Object.keys(arMethods).forEach(function(name){
            v = arMethods[name];

            BX24.callMethod(v, {}, function(result){
                s_field_data = result.answer.result;
                Object.keys(s_field_data).forEach(function (k) {
                    v = s_field_data[k];
                    if(dont_use.includes(v.type)){
                        return;
                    }
                    console.log(v);
                    code_button = $('<div>', {
                        'html': '<b><i>'+name+'</i><br>'+v.title+'</b><br>Код для вставки: {' + field_data['FIELD_ID'] + '_' + k +'}',
                        'class': 'iblock-field-detail-copy-code list-group-item list-group-item-action'
                    });
                    code_button.on('click', function () {
                        navigator.clipboard.writeText('{'+field_data['FIELD_ID'] + '_' + k +'}');
                    });
                    $('.iblock-field-detail-container').append(code_button);
                });
            });
        });
    }else if(field_data.TYPE!='F' && field_data.TYPE!='E' && field_data.TYPE!='E:EList') {
        code_button = $('<div>', {
            'text': 'Код для вставки: {' + field_data['FIELD_ID'] + '}',
            'class': 'iblock-field-detail-copy-code list-group-item list-group-item-action'
        });
        code_button.on('click', function () {
            navigator.clipboard.writeText('{' + field_data['FIELD_ID'] + '}');
        });
        $('.iblock-field-detail-container').append(code_button);


        Object.keys(field_data).forEach(function (k) {
            if (selected.includes(k)) {
                v = field_data[k];
                element = $('<div>', {
                    'text': k + ': ' + v,
                    'class': 'iblock-field-detail list-group-item list-group-item-action'
                });
                $('.iblock-field-detail-container').append(element);
            }
        });
    }
}

render_templates_list_for_generate = function(e){
    element_id = $(this).data('el_id');
    iblock_id = $(this).data('ib_id');
    $('.iblock-list-elements-template').empty();
    BX24.callMethod(
        'documentgenerator.template.list',
        {
            filter: {
                '%name': iblock_id+'%'
            }
        },
        function(result) {
            if (result.error()) {
                return false;
            } else {
                templates = result.answer.result.templates;
                Object.keys(templates).forEach(function (k) {
                    v = templates[k];
                    element = $('<div>', {
                        'html': '<i class="fas fa-download"></i> '+v.name.split('%')[1],
                        'class': 'iblock-field-name list-group-item list-group-item-action'
                    });
                    element.data('element_id', element_id);
                    element.data('template_id', v.id);
                    element.data('ib_id',iblock_id);
                    element.on('click',prepare_document);
                    $('.iblock-list-elements-template').append(element);

                });
            }
        }
     );

}
prepare_document = function(e){
    iblock_id = $(this).data('ib_id');
    element_id = $(this).data('element_id');
    var template_id = $(this).data('template_id');
    params = {
        'IBLOCK_TYPE_ID': 'lists',
        'IBLOCK_ID': iblock_id,
        'ELEMENT_ID': element_id
    };
    BX24.callMethod(
        'lists.element.get',
        params,
        function(result)
        {
            var fields = result.answer.result[0];
            var prepared = {}
            Object.keys(fields).forEach(function(k){
                v = fields[k];

                if(typeof v == 'object' && v){
                    var value = Object.values(v)[0];
                    BX24.callMethod(
                        'lists.field.get',
                        {
                            'IBLOCK_TYPE_ID': 'lists',
                            'IBLOCK_ID': iblock_id,
                            'FIELD_ID': k,
                        },
                        function(result){
                            data = Object.values(result.answer.result)[0];
                            switch(data.TYPE){
                                case 'L':
                                    prepared[k]=data.DISPLAY_VALUES_FORM[value];
                                    break;
                                case 'S':
                                case 'N':
                                case 'S:Money':
                                case 'S:Date':
                                case 'S:DateTime':
                                    prepared[k]=value;
                                    break;
                                case 'S:ECrm':
                                    get_crm_entity_data(k,value, function(crmData){
                                        prepared = Object.assign(prepared,crmData);
                                    });
                                    break;
                                case 'E':
                                case 'E:EList':
                                    //В данный момент не передается id инфоблока, поэтому получить поля элемента невозможно
                                    break;
                                case 'S:employee':
                                    get_user_entity_data(k, value, function(userData){
                                        prepared = Object.assign(prepared,userData);
                                    });
                                    break;
                            }
                        }
                    );
                }else{
                    prepared[k] = v;
                }


            });
            setTimeout(function(){
                console.log(prepared);
                //download_document(template_id, prepared);
            },Object.keys(fields).length*30);


        }
    );
}
get_user_entity_data = function(field_code,value, callback){
    var fields = {};
    BX24.callMethod(
        'user.get',
        {'ID': value},
        function(result){
            data = result.answer.result[0];
            Object.keys(data).forEach(function(k){
                v = data[k];
                if(typeof v != 'object'){
                    fields[field_code+'_'+k] = v;
                }
            });
            callback(fields);
        }
    );
}

get_crm_entity_data = function(field_code,value, callback){
    splited = value.split('_');
    code = splited[0];
    id = splited[1];

    var fields = {};
    arMethods = {
        'L': 'crm.lead.get',
        'C': 'crm.contact.get',
        'CO': 'crm.company.get',
        'D': 'crm.deal.get'
    }
    BX24.callMethod(
        arMethods[code],
        {'ID': id},
        function(result){
            data = result.answer.result;
            Object.keys(data).forEach(function(k){
                v = data[k];
                if(typeof v != 'object'){
                    fields[field_code+'_'+k] = v;
                }
            });
            callback(fields);
        }
    );
}
download_document = function(t_id,fields){
    params = {
        'templateId': t_id,
        'providerClassName': 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
        'value': 1,
        'values': fields,
    };
    BX24.callMethod(
        'documentgenerator.document.add',
        params,
        function(result){
            if(result.error()){
                return false;
            }else{
                result = result.answer.result.document.downloadUrlMachine;
                var link = document.createElement('a');
                link.setAttribute('href',result);
                link.setAttribute('download','download');
                link.click();
            }
        }
    );
}

encodeDoc = function(file) {
    var reader = new FileReader();
    reader.onloadend = function() {
        base64_data = reader.result.split(',')[1];
        send_template(base64_data);
    }
    reader.readAsDataURL(file);
}

send_template = function(file){
    params = {
        'fields':{
            'name': $('#iblock_selector').val()+'%'+$('input[name="template_name"]').val(),
            'file': file,
            'numeratorId': 1,
            'region': 'ru',
        }
    }
    BX24.callMethod(
        'documentgenerator.template.add',
        params,
        function(result){
            $('.templates-list').empty();
            render_templates_list();
            $("form[name='upload_template']").trigger('reset');
            $("button[name='submit']").removeAttr('disabled');
        }
    );
}

render_templates_list = function(){
    $('#clearable-templates-list').empty();
    params = {
        'select':['name','id']
    }
    BX24.callMethod(
        'documentgenerator.template.list',
        params,
        function(result){
            if (result.error()) {
                return false;
            } else {
                templates = result.answer.result.templates;

                Object.keys(templates).forEach(function(k){
                    var v = templates[k];


                    var data = v.name.split('%');

                    BX24.callMethod(
                        'lists.get',
                        {
                            'IBLOCK_TYPE_ID': 'lists',
                            'IBLOCK_ID': data[0],
                            'select': ['NAME', 'ID']
                        },
                        function(result) {
                            if (result.error()) {
                                return false;
                            } else {
                                container = $('<tr>',{
                                    'class': 'template-list-template-container'
                                });

                                iblock_name = result.answer.result[0].NAME;

                                id = $('<td>',{
                                    'text': v.id,
                                    'class': 'template-list-template-title bg-light'
                                });

                                title = $('<td>',{
                                    'text': data[1],
                                    'class': 'template-list-template-title'
                                });

                                iblock_name = $('<td>',{
                                    'text': iblock_name,
                                    'class': 'template-list-template-title'
                                });

                                download_cell = $('<td>');
                                download = $('<a>',{
                                    'text': 'Скачать',
                                    'download': 'true',
                                    'class': 'template-list-template-download btn btn-info'
                                });
                                download_cell.append(download);



                                delete_cell = $('<td>');
                                delete_btn = $('<button>',{
                                    'text': 'Удалить',
                                    'class': 'btn btn-danger template-list-template-delete',
                                });
                                delete_btn.data('template_id',v.id);
                                delete_cell.append(delete_btn);

                                delete_btn.on('click',delete_template);

                                container.append(id);
                                container.append(title);
                                container.append(iblock_name);
                                container.append(download_cell);
                                container.append(delete_cell);

                                $('#clearable-templates-list').append(container);

                            }
                        }
                    );

                });
            }
        }
    );
}

delete_template = function(e){
    template_id = $(this).data('template_id');
    BX24.callMethod(
        'documentgenerator.template.delete',
        {'id': template_id},
        function(result){
            render_templates_list();
        }
    );
}

$(document).ready(function(){
    bsCustomFileInput.init();
    var file;

    $("input[name='template']").on('change', function(){
        file = this.files[0];
    });

    $("form[name='upload_template']").on('submit',function(e){
        e.preventDefault();
        e.stopPropagation();
        $("button[name='submit']").attr('disabled','disabled');
        encodeDoc(file);
    });

    $("#add_activity").on('click',create_activity);
    $("#del_activity").on('click',delete_activity);


});

create_activity = function(){
    var params = {
        'CODE': 'generate_document',
        'HANDLER': 'http://aastudio.tech/listgenerator/listgenerator_activity.php',
        'AUTH_USER_ID': 1,
        'USE_SUBSCRIPTION': 'Y',
        'NAME': {
            'ru': 'Создание документа',
        },
        'DESCRIPTION': {
            'ru': 'Действие создает документ из элемента списка по загруженому шаблону',
        },
        'PROPERTIES': {
            'templateID': {
                'Name': {
                    'ru': 'ID шаблона',
                },
                'Type': 'string',
                'Required': 'Y',
                'Multiple': 'N',
            }
        },
        'RETURN_PROPERTIES': {
            'document_link': {
                'Name': {
                    'ru': 'Ссылка на документ',
                },
                'Type': 'string',
                'Multiple': 'N',
                'Default': null
            },
            'document_id': {
                'Name': {
                    'ru': 'ID документа',
                },
                'Type': 'string',
                'Multiple': 'N',
                'Default': null
            }
        },
        'DOCUMENT_TYPE': ['lists', 'BizprocDocument'],
        'FILTER': {
            INCLUDE: [
                ['lists']
            ]
        }
    };

    BX24.callMethod(
        'bizproc.activity.add',
        params,
        function(result)
        {
            if(result.error())
                alert("Ошибка: " + result.error());
            else
                alert("Действие добавлено");
        }
    );
}
delete_activity = function(){
    var params = {
        code: 'generate_document'
    };

    BX24.callMethod(
        'bizproc.activity.delete',
        params,
        function(result)
        {
            if(result.error())
                alert('Ошибка: ' + result.error());
            else
                alert("Действие удалено");
        }
    );
}
