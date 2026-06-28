<?php

require_once 'config.php';

class SupabaseClient {
    private $url;
    private $apiKey;
    
    public function __construct() {
        $this->url = SUPABASE_URL;
        $this->apiKey = SUPABASE_KEY;
    }
    public function insert($tabla, $data) {
        return $this->request('POST', $tabla, $data);
    }
    private function request($metodo, $tabla, $data = null) {
        $ch = curl_init($this->url . "/" . $tabla);
        $headers = [
            'Content-Type: application/json',
            'apiKey: ' . $this->apiKey,
            'Authorization: Bearer ' . $this->apiKey,
            'Prefer: return=representation'
        ];
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURSLOPT_CUSTOMREQUEST, $metodo);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
            
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);
            
        if ($error) {
            return ['error' => $error];
        }
        return json_decode($response, true);
    }
}

?>