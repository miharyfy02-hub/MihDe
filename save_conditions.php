<?php
if($_SERVER['REQUEST_METHOD']==='POST'){
    $data = file_get_contents('php://input');
    $conditions = file_exists('conditions.json') ? json_decode(file_get_contents('conditions.json'), true) : [];
    $new = json_decode($data, true);
    $conditions[$new['page_id']] = $new;
    file_put_contents('conditions.json', json_encode($conditions, JSON_PRETTY_PRINT));
    echo json_encode(['success'=>true]);
}
?>
