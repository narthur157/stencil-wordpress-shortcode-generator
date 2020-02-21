<?php
function pred_login_function($atts = [], $content = null, $tag = '') {
  $intProp = $atts['intProp'];
  $testProp = $atts['testProp'];
  return '<pred-login  int-prop="$intProp" test-prop="$testProp"></pred-login>';
}
    
add_shortcode(pred_login, 'pred_login_function');

function pred_product_function($atts = [], $content = null, $tag = '') {
  return '<pred-product ></pred-product>';
}
    
add_shortcode(pred_product, 'pred_product_function');
?>