<?php
    $jsonFile = 'topics.json';
    $sectionsFile = 'sections.json';

    $jsonContent = file_exists($jsonFile) ? file_get_contents($jsonFile) : '[]';
    $jsonArray = json_decode($jsonContent, true);

    $sectionsArray = json_decode((file_exists($sectionsFile) ? file_get_contents($sectionsFile) : '[]'),true);


    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $data = json_decode(file_get_contents("php://input"), true);
    
        if (isset($data["index"])) {
            $index = intval($data["index"]);
            
            $topic = $jsonArray[$index]["title"];

            $i=0;
            while($i<count($sectionsArray)){
                if($sectionsArray[$i]["topic"]===$topic){
                    array_splice($sectionsArray,$i,1);
                }else{
                    $i++;
                }
            }
            file_put_contents($sectionsFile, json_encode($sectionsArray, JSON_PRETTY_PRINT));

            array_splice($jsonArray, $index, 1);

            file_put_contents($jsonFile, json_encode($jsonArray, JSON_PRETTY_PRINT));
    
            header('Content-Type: application/json');
            echo json_encode(["success" => true, "deletedIndex" => $index, "topic" => $sectionsArray]);
        } elseif(isset($data["title"])){
            $jsonArray[] = $data;
            file_put_contents($jsonFile, json_encode($jsonArray, JSON_PRETTY_PRINT));

            header('Content-Type: application/json');
            echo json_encode(["status" => "success"]);
        } else {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(["success" => false, "error" => "No action to perform"]);
        }
    }elseif($_SERVER["REQUEST_METHOD"] === "GET"){
        $topic = isset($_GET['title']) ? $_GET['title'] : null;
        if($topic){
            foreach($jsonArray as $t){
                if($t['title'] === $topic){
                    header('Content-Type: application/json');
                    echo json_encode(["success" => true, "topic" => $t]);
                    exit;
                }
            }
            header('HTTP/1.1 404 Not Found');
            echo json_encode(["success" => false, "error" => "No topic was found"]);
        }
    } else {
        echo json_encode(["success" => false, "error" => "Invalid request method"]);
    }
?>
