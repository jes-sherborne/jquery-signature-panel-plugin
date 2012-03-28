require 'sinatra'
require 'signature-panel.rb'
require 'securerandom'

get '/' do
    send_file 'public/index.html'
end

post '/process-signature' do
    image = SignaturePanel::GenerateImage(request.body.read)
    filename = ['signatures/img-', SecureRandom.hex(16), '.png'].join

    image.write(filename)

    # If you want to stream your PNG directly to a database instead of saving a file,
    # you can get a binary stream like this:
    # image.to_blob {self.format = "PNG"}

    content_type :text
    body ["/", filename].join
end

get '/signatures/:filename' do
    send_file ['signatures/', params[:filename]].join, :type => :png
end