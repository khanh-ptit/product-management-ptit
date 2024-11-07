module.exports = (objectPagination, query, countProducts) => {
    if (query.page) {
        objectPagination.currentPage = parseInt(query.page)
    }

    // console.log(objectPagination.currentPage)
    objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems

    // console.log(countProducts)
    const totalPages = Math.ceil(countProducts / objectPagination.limitItems)
    // console.log(totalPages)
    objectPagination.totalPages = totalPages
    // End pagination
    return objectPagination
}