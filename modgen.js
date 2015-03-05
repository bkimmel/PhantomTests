//Test Module Generator:
//setup: npm install
//usage: node *this* [*directory_to_process*]

 

//traverse directory & find template.txt => *templates
function gettemplates(pth) {

}

//get active RSIs => *rsis
//get active RSI store => *rsistore

//for each template.txt file in *templates => *filepath
	//get directory of *filepath => *dir
	//for each RSI in *rsis => *rsi
		//See if *dir/*rsi exists {
			//} it does not:
				//create *dir/*rsi
			//template *filepath with *rsistore[*rsi] => *renderedmodule
		