module.exports = {
    apps: [{
        name: "tenshi",
        script: `${__dirname}/src/server.js`,
        cwd:`${__dirname}/src/`,
        out_file:`${__dirname}/logs.log`,
        error_file:`${__dirname}/errors.log`,
        log_date_format:"YYYY-MM-DD HH:mm Z",
        watch:false,
        env: {
            NODE_ENV: "PRODUCTION",
            NODE_OPTIONS: "--max_old_space_size=4096",
        },
    }],
}