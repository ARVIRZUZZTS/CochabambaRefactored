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
    public function get($url) {
    $ch = curl_init($url);
    $headers = [
        'apikey: ' . $this->apiKey,
        'Authorization: Bearer ' . $this->apiKey
    ];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        error_log("Error Supabase $httpCode en URL: $url");
        return []; 
    }
    
    return json_decode($response, true);
}
    public function update($tabla, $data, $filtro) {
        $ch = curl_init($this->url . "/" . $tabla . "?" . $filtro);
        $headers = [
            'Content-Type: application/json',
            'apikey: ' . $this->apiKey,
            'Authorization: Bearer ' . $this->apiKey,
            'Prefer: return=representation'
        ];

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }
    private function request($metodo, $tabla, $data = null) {
        $ch = curl_init($this->url . "/" . $tabla);
        $headers = [
            'Content-Type: application/json',
            'apiKey: ' . $this->apiKey,
            'Authorization: Bearer ' . $this->apiKey,
            'Prefer: return=minimal, resolution=merge-duplicates'
        ];
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $metodo);
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