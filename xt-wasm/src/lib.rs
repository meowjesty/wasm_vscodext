mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn greet() -> js_sys::JsString {
    js_sys::JsString::from("Hello, this is the wasm rust side string!")
}

#[wasm_bindgen(js_name = makeRequest)]
pub async fn make_request() {
    let body = reqwest::get("https://www.google.com")
        .await
        .expect("Failed get request!")
        .text()
        .await
        .expect("Failed text!");

    println!("body = {body:?}");
}
