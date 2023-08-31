
const Login=()=>{
    return (
        <div className="flex items-center justify-center pt-10">
        <div className=" bg-white p-8 rounded-md shadow-md font-['Inter'] w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form>
          <div className="mb-4">
            <label for="username" className="block text-sm font-medium text-gray-800">Username</label>
            <input type="text" id="username" name="username" className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400" required/>
          </div>
          <div className="mb-4">
            <label for="password" className="block text-sm font-medium text-gray-800">Password</label>
            <input type="password" id="password" name="password" className="mt-1 px-4 py-2 w-full rounded-md border border-gray-400 focus:outline-none focus:ring focus:border-blue-400" required/>
          </div>
          <button type="submit" className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring focus:border-gray-400">Login</button>
        </form>
      </div>
      </div>
      
    )
}
export default Login;