<?php
    $topicsFile = 'topics.json';
    $sectionsFile = 'sections.json';

    $topicsArray = json_decode((file_exists($topicsFile) ? file_get_contents($topicsFile) : '[]'),true);
    $sectionsArray = json_decode((file_exists($sectionsFile) ? file_get_contents($sectionsFile) : '[]'),true);

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $data = json_decode(file_get_contents("php://input"), true);
    
        if (isset($data["index"]) && isset($data["topic"])) {
            $index = intval($data["index"]);
            $topic = $data["topic"];

            $currentIndex = 0;
            for($i = 0; $i < count($sectionsArray); $i++){
                if($sectionsArray[$i]["topic"]===$topic){
                    if($currentIndex === $index){
                        array_splice($sectionsArray, $i, 1);

                        file_put_contents($sectionsFile, json_encode($sectionsArray, JSON_PRETTY_PRINT));
    
                        header('Content-Type: application/json');
                        echo json_encode(["success" => true, "deletedIndex" => $index]);
                        exit;
                    }else{
                        $currentIndex++;
                    }
                }
                
            }
    
            header('HTTP/1.1 404 Not Found');
            echo json_encode(["success" => false, "error" => "Invalid index or topic"]);
        } elseif(isset($data["summary"])){
            $sectionsArray[] = $data;
            file_put_contents($sectionsFile, json_encode($sectionsArray, JSON_PRETTY_PRINT));

            header('Content-Type: application/json');
            echo json_encode(["status" => "success"]);
        } else {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(["success" => false, "error" => "No action to perform"]);
        }
    }elseif($_SERVER["REQUEST_METHOD"] === "GET"){
        $topic = isset($_GET['title']) ? $_GET['title'] : null;
        if($topic){
            foreach($topicsArray as $t){
                if($t['title'] === $topic){
                    $sectionsForTopic = [];
                    foreach($sectionsArray as $s){
                        if($s['topic'] === $topic){
                            $sectionsForTopic[] = $s;
                        }
                    }
                    header('Content-Type: application/json');
                    echo json_encode(["success" => true, "sections" => $sectionsForTopic]);
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
