export default function Footer(){
    return(
        <footer className="w-full bg-black text-white py-6 px-10 flex justify-between items-center ">
        <div className="text-sm">© 2024 GamePac AI by Jetapult. All rights reserved.</div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-[#B9FF66] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#B9FF66] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#B9FF66] transition-colors">Contact Us</a>
        </div>
        </footer>
    )
}