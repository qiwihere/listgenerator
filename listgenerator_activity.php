<?php

$element_id = $_REQUEST['document_id'][2];
$iblock_id = explode('_', $_REQUEST['document_type'][2])[1];
$template_id = $_REQUEST['properties']['templateID'];

$fields = callB24Method('lists.element.get',[
    'IBLOCK_TYPE_ID'=> 'lists',
    'IBLOCK_ID'=> $iblock_id,
    'ELEMENT_ID'=> $element_id,
]);

$arFields = [];
foreach($fields[0] as $k=>$field){
    if(is_array($field)){
        $field_data = callB24Method('lists.field.get',[
            'IBLOCK_TYPE_ID'=> 'lists',
            'IBLOCK_ID'=> $iblock_id,
            'FIELD_ID'=> $k,
        ]);
        $field_data = array_pop($field_data);
        switch($field_data['TYPE']){
            case 'L':

                $arFields[$k]=$field_data['DISPLAY_VALUES_FORM'][array_pop($field)];
                break;
            case 'S':
            case 'N':
            case 'S:Money':
            case 'S:Date':
            case 'S:DateTime':
                $arFields[$k]=array_pop($field);
                break;
            case 'S:ECrm':
                $raw = explode('_', array_pop($field));
                $code = $raw[0];
                $id = $raw[1];

                $arMethods = [
                    'L'=> 'crm.lead.get',
                    'C'=> 'crm.contact.get',
                    'CO'=> 'crm.company.get',
                    'D'=> 'crm.deal.get'
                ];
                $crm_data = callB24Method($arMethods[$code],['ID'=>$id]);
                foreach($crm_data as $crm_code=>$data_field){
                    if(!is_array($data_field)){
                        $arFields[$k.'_'.$crm_code] = $data_field;
                    }
                }
                break;
            case 'S:employee':
                $data = callB24Method('user.get', ['ID'=>$field])[0];
                foreach($data as $field_code=>$data_field){
                    if(!is_array($data_field)){
                        $arFields[$k.'_'.$field_code] = $data_field;
                    }
                }

        }
    }else{
        $arFields[$k]=$field;
    }

}

$doc_data = callB24Method('documentgenerator.document.add',[
    'templateId'=> $template_id,
    'providerClassName'=> 'Bitrix\\DocumentGenerator\\DataProvider\\Rest',
    'value'=> 1,
    'values'=> $arFields,
]);
$public_url = callB24Method('documentgenerator.document.enablepublicurl',[
    'id'=>$doc_data['document']['id']
]);
$link_public = $public_url;
$email_file_id = $doc_data['document']['emailDiskFile'];

callB24Method('bizproc.event.send', array(
    "EVENT_TOKEN" => $_REQUEST["event_token"],
    "RETURN_VALUES" => array(
        'document_link' => $link_public,
        'document_id' => $email_file_id
    ),
    'LOG_MESSAGE' => 'Документ получен'
));



function callB24Method( $method, $params)
{
    global $_REQUEST;
    $auth = $_REQUEST['auth'];

    $c = curl_init('https://'.$auth['domain'].'/rest/'.$method.'.json');
    $params["auth"] = $auth["access_token"];

    curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($c, CURLOPT_POST, true);
    curl_setopt($c, CURLOPT_POSTFIELDS, http_build_query($params));

    $response = curl_exec($c);
    $response = json_decode($response, true);

    return $response['result'];
}
function _log($title, $data)
{
    @file_put_contents(dirname(__FILE__).'/log.txt', '================ '.$title.' ================'.PHP_EOL.print_r($data,1).PHP_EOL, FILE_APPEND);
}


