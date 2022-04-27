#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let body = reqwest::get("https://www.google.com").await?.text().await?;
    println!("body = {body:?}");

    Ok(())
}
