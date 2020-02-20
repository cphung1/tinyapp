# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

Users need to create an account and be logged in to create shortened URLs. Their accounts will store a list of the URLs they have shortened. Users are also able to edit and delete the URLs. One does not need an account to access these shortened URL links though.   

## Final Product
URLS page when logged in
!["Screenshot of URLS page when logged in"](https://github.com/cphung1/tinyapp/blob/master/docs/urls-page-logged.png)

Enter a new URL
!["Screenshot of new URL page"](https://github.com/cphung1/tinyapp/blob/master/docs/new-url.png)

Edit an existing URL
!["Screenshot of short page"](https://github.com/cphung1/tinyapp/blob/master/docs/edit-url.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.