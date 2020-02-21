<?php

vc_map( array(
  "name" => __("pred-login"),
  "base" => "pred-login",
  "category" => __('Predecessor'),
  "params" => array(
    array(
      "type" => "textfield",
      "holder" => "div",
      "class" => "",
      "heading" => __("Text"),
      "param_name" => 
      "value" => __(undefined),
      "description" => ("Test docs"),
    )
      
    array(
      "type" => "textfield",
      "holder" => "div",
      "class" => "",
      "heading" => __("Text"),
      "param_name" => 
      "value" => __('defaultValue'),
      "description" => (""),
    )
      )
) );,
vc_map( array(
  "name" => __("pred-product"),
  "base" => "pred-product",
  "category" => __('Predecessor'),
  "params" => array()
) );
?>