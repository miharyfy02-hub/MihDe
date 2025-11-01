<?php
$PAGE_ACCESS_TOKEN = "YEAAKeOtI9r9cBP7yXTAbahLU2ltwUIXndIZCZBiRNJRCCuEjhDVi5m3SbGOb4ZADXYOPVy28FMWbENsZBvngtpZAZCgIoTqpZBTrRCEoKoC2360BwIV5iAVTZBrZA2vWl5dZC9eU3TyZCo4RCujxoG47c7VWWeqczJT5ryiQ022ZAt2Y5GzEvhXD6DTnNKfIeSufMpmoZAyw9ORTfEDwZDZD";

$input = json_decode(file_get_contents("php://input"), true);
$entry = $input['entry'][0];
$changes = $entry['changes'][0]['value'] ?? null;

if($changes && $changes['item']==='comment' && $changes['verb']==='add'){
    $commentId = $changes['comment_id'];
    $message = $changes['message'];
    $pageId = $changes['post_id'] ?? $changes['parent_id'];

    $conditions = file_exists('conditions.json') ? json_decode(file_get_contents('conditions.json'), true) : [];
    $cond = $conditions[$pageId] ?? ['default_reply'=>"Misaotra tamin'ny commentaire!", 'custom_conditions'=>[]];

    $reply = $cond['default_reply'];
    foreach($cond['custom_conditions'] as $c){
        if(stripos($message, $c['keyword'])!==false){
            $reply = $c['reply'];
            break;
        }
    }

    // Mandefa reply
    $url = "https://graph.facebook.com/v17.0/$commentId/comments?message=".urlencode($reply)."&access_token=$PAGE_ACCESS_TOKEN";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
}
?>
