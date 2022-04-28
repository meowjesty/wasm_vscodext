/// NOTE(alex): Build this `wasm-pack build --target nodejs`.
mod utils;

use k8s_openapi::api::core::v1 as api;
use wasm_bindgen::{prelude::*, JsCast};
use wasm_bindgen_futures::JsFuture;
use web_sys::{console, Request, RequestInit, RequestMode, Response};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(module = "/request.js")]
extern "C" {
    #[wasm_bindgen(catch)]
    fn request() -> Result<js_sys::Promise, JsValue>;
}

#[wasm_bindgen]
pub fn greet() -> js_sys::JsString {
    js_sys::JsString::from("Hello, this is the wasm rust side string!")
}

#[wasm_bindgen]
pub async fn kubernetes() {
    let pod_spec = api::PodSpec::default();
    console::log_1(&format!("{pod_spec:#?}").into());

    match request() {
        Ok(response) => {
            let response = wasm_bindgen_futures::JsFuture::from(response)
                .await
                .expect("Failed to get response in rust!");
            let body = js_sys::Uint8Array::new(&response);

            console::log_1(&format!("Rust side got a response with {:?}", body.length()).into());
        }
        Err(fail) => console::error_1(&fail),
    }
}

#[wasm_bindgen(js_name = rustRequest)]
pub async fn rust_request() -> Result<JsValue, JsValue> {
    console::log_1(&"Starting rust request in rust!".into());

    let mut opts = RequestInit::new();
    opts.method("GET");
    opts.mode(RequestMode::Cors);

    let url = format!("https://www.google.com/");

    let request = Request::new_with_str_and_init(&url, &opts)?;

    let window = web_sys::window().unwrap();
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;

    // `resp_value` is a `Response` object.
    assert!(resp_value.is_instance_of::<Response>());
    let resp: Response = resp_value.dyn_into().unwrap();

    // Convert this other `Promise` into a rust `Future`.
    let json = JsFuture::from(resp.json()?).await?;

    // Send the `Branch` struct back to JS as an `Object`.
    Ok(json)
}

// TODO(alex) [high] 2022-04-27: Make this work, we get a big error of:
// `rejected promise not handled within 1 second: RuntimeError: unreachable`
//
// That errors out on:
// `at __wbg_adapter_24 (c:\dev\rust\codext\xt-wasm\pkg\xt_wasm.js:208:1)`
// `at real (c:\dev\rust\codext\xt-wasm\pkg\xt_wasm.js:193:1)`
// #[wasm_bindgen(js_name = makeRequest)]
// pub async fn make_request() -> js_sys::JsString {
//     let body = reqwest::get("https://www.google.com")
//         .await
//         .expect("Failed get request!")
//         .text()
//         .await
//         .expect("Failed text!");

//     js_sys::JsString::from(body)
// }
